import { Pilot, Milestone, PilotMonitoringMetrics, DelayRiskStatus } from '../types';

/**
 * Calculates real-time AI Pilot Monitoring metrics for an active pilot.
 * 
 * - Days until next milestone deadline (from milestones table)
 * - Current completion percentage
 * - Risk of Delay: Low (on-track), Medium (slightly behind), High (significantly behind or overdue deadline)
 */
export function calculatePilotMonitoringMetrics(
  pilot: Pilot,
  referenceDate: Date = new Date()
): PilotMonitoringMetrics {
  const milestones: Milestone[] = [...(pilot.milestones || [])].sort(
    (a, b) => a.milestoneNumber - b.milestoneNumber
  );

  const totalMilestones = milestones.length || 4;
  const completedMilestonesList = milestones.filter(
    (m) => m.status === 'verified' || m.status === 'paid'
  );
  const completedMilestones = completedMilestonesList.length;

  // Completion Percentage: based on milestone weights or count
  let completionPercentage = 0;
  if (milestones.length > 0) {
    const totalWeight = milestones.reduce((sum, m) => sum + (m.weightPercent || 25), 0);
    const completedWeight = completedMilestonesList.reduce(
      (sum, m) => sum + (m.weightPercent || 25),
      0
    );
    completionPercentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  } else {
    completionPercentage = 0;
  }

  // Elapsed Time Percentage
  const startDate = new Date(pilot.startDate);
  const endDate = new Date(pilot.endDate);
  let elapsedTimePercentage = 0;

  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate.getTime() > startDate.getTime()) {
    const totalDurationMs = endDate.getTime() - startDate.getTime();
    const elapsedMs = referenceDate.getTime() - startDate.getTime();
    const rawElapsed = (elapsedMs / totalDurationMs) * 100;
    elapsedTimePercentage = Math.min(100, Math.max(0, Math.round(rawElapsed)));
  }

  // Next Milestone: first milestone not verified or paid
  const nextMilestone = milestones.find(
    (m) => m.status !== 'verified' && m.status !== 'paid'
  ) || null;

  let daysUntilNextDeadline: number | null = null;
  let deadlineDateStr: string | null = null;
  let isOverdue = false;
  let isDeadlineNear = false;

  if (nextMilestone) {
    // If deadline is explicitly stored on milestone, use it.
    // Otherwise interpolate deadline based on pilot duration and milestone number.
    if (nextMilestone.deadline) {
      deadlineDateStr = nextMilestone.deadline;
    } else if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const stepFraction = nextMilestone.milestoneNumber / totalMilestones;
      const interpTime = startDate.getTime() + (endDate.getTime() - startDate.getTime()) * stepFraction;
      deadlineDateStr = new Date(interpTime).toISOString().split('T')[0];
    }

    if (deadlineDateStr) {
      const deadlineDate = new Date(deadlineDateStr);
      if (!isNaN(deadlineDate.getTime())) {
        // Set time to end of deadline day for fair calculation
        deadlineDate.setHours(23, 59, 59, 999);
        const diffMs = deadlineDate.getTime() - referenceDate.getTime();
        daysUntilNextDeadline = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysUntilNextDeadline < 0) {
          isOverdue = true;
        } else if (daysUntilNextDeadline <= 3) {
          isDeadlineNear = true;
        }
      }
    }
  }

  // Schedule Difference: completion % minus elapsed time %
  const scheduleDifference = completionPercentage - elapsedTimePercentage;

  // Compute Risk of Delay
  let riskOfDelay: DelayRiskStatus = 'low';
  let riskReason = 'On-track: Milestone progress matches timeline schedule.';

  if (isOverdue) {
    riskOfDelay = 'high';
    const overdueDays = Math.abs(daysUntilNextDeadline || 0);
    riskReason = `Overdue: Milestone deadline passed ${overdueDays} day${overdueDays === 1 ? '' : 's'} ago without verification.`;
  } else if (scheduleDifference <= -20) {
    riskOfDelay = 'high';
    riskReason = `Critical schedule lag: ${elapsedTimePercentage}% time elapsed vs only ${completionPercentage}% progress delivered (-${Math.abs(scheduleDifference)}% gap).`;
  } else if (isDeadlineNear && scheduleDifference < 0) {
    riskOfDelay = 'high';
    riskReason = `High risk: Milestone deadline due in ${daysUntilNextDeadline} day${daysUntilNextDeadline === 1 ? '' : 's'} while trailing schedule.`;
  } else if (scheduleDifference <= -8) {
    riskOfDelay = 'medium';
    riskReason = `Slight delay: Delivery pace trailing elapsed schedule by ${Math.abs(scheduleDifference)}%.`;
  } else if (isDeadlineNear) {
    riskOfDelay = 'medium';
    riskReason = `Approaching deadline: Deliverables due in ${daysUntilNextDeadline} day${daysUntilNextDeadline === 1 ? '' : 's'}.`;
  } else {
    riskOfDelay = 'low';
    riskReason = scheduleDifference >= 0
      ? `On schedule: Completion (${completionPercentage}%) ahead of or equal to elapsed timeline (${elapsedTimePercentage}%).`
      : `Healthy velocity: Completion (${completionPercentage}%) roughly aligns with time elapsed (${elapsedTimePercentage}%).`;
  }

  return {
    pilotId: pilot.id,
    pilotTitle: pilot.problemTitle,
    startupName: pilot.startupName,
    departmentName: pilot.departmentName,
    completionPercentage,
    elapsedTimePercentage,
    nextMilestone,
    daysUntilNextDeadline,
    deadlineDate: deadlineDateStr,
    isOverdue,
    isDeadlineNear,
    riskOfDelay,
    riskReason,
    scheduleDifference,
    totalMilestones,
    completedMilestones,
  };
}

/**
 * Filter active non-completed pilots and calculate monitoring metrics for each.
 */
export function getActivePilotsMonitoring(
  pilots: Pilot[],
  referenceDate: Date = new Date()
): PilotMonitoringMetrics[] {
  return pilots
    .filter((p) => p.status === 'active')
    .map((p) => calculatePilotMonitoringMetrics(p, referenceDate));
}
