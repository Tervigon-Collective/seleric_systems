import type { Job } from "bullmq"
import pino from "pino"

import { sendApprovalNotification } from "../processors/notifications.js"

const logger = pino({ name: "job:send-notification" })

export async function processSendNotification(job: Job) {
  logger.info({ jobId: job.id }, "sending_notification")
  return sendApprovalNotification(job.data)
}
