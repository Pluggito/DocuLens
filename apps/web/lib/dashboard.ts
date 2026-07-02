import { getDb, documents, eq, desc, and } from "@repo/db";
import { formatDistanceToNow } from "date-fns";

export interface DashboardMetrics {
  totalProcessed: string;
  automationRate: string;
  timeSaved: string;
  needsReview: string;
}

export interface RecentDocument {
  id: string;
  name: string;
  type: string;
  status: string;
  date: string;
  size: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentDocuments: RecentDocument[];
}

// Utility to format bytes
export function formatFileSize(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const db = await getDb();

  // Fetch all documents for user to calculate metrics
  // In a real huge production app, we would use aggregations (COUNT, etc)
  // but for simplicity and smaller datasets, fetching and reducing is fine.
  // Alternatively we can use db aggregations.
  const userDocs = await db.select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));

  // Metrics Calculation
  let totalProcessed = 0;
  let automatedCorrectly = 0;
  let needsReviewCount = 0;

  userDocs.forEach(doc => {
    if (doc.processingStatus === "completed") {
      totalProcessed++;
      if (doc.confidence && doc.confidence > 0.8) {
        automatedCorrectly++;
      }
    }
    if (doc.processingStatus === "failed" || (doc.processingStatus === "completed" && doc.confidence && doc.confidence <= 0.8)) {
      needsReviewCount++;
    }
  });

  const automationRateNum = totalProcessed > 0 ? (automatedCorrectly / totalProcessed) * 100 : 0;
  const automationRate = `${automationRateNum.toFixed(1)}%`;
  
  // Assume each document processed saves ~5 mins of manual entry
  const timeSavedMinutes = totalProcessed * 5;
  const timeSaved = timeSavedMinutes > 60 
    ? `${(timeSavedMinutes / 60).toFixed(1)} hrs` 
    : `${timeSavedMinutes} min`;

  const metrics: DashboardMetrics = {
    totalProcessed: totalProcessed.toString(),
    automationRate,
    timeSaved,
    needsReview: needsReviewCount.toString(),
  };

  // Recent Documents Mapping (Top 5)
  const recentDocuments: RecentDocument[] = userDocs.slice(0, 5).map(doc => {
    let statusDisplay = "Error";
    if (doc.processingStatus === "verified") {
      statusDisplay = "Verified";
    } else if (doc.processingStatus === "completed") {
      statusDisplay = "Needs Review";
    } else if (doc.processingStatus === "uploading" || doc.processingStatus === "processing") {
      statusDisplay = "Pending";
    }

    // Default to 'General' if no type extracted yet
    const typeDisplay = doc.documentType || "General";

    return {
      id: doc.id,
      name: doc.fileName,
      type: typeDisplay.charAt(0).toUpperCase() + typeDisplay.slice(1),
      status: statusDisplay,
      date: formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true }),
      size: formatFileSize(doc.fileSize),
    };
  });

  return { metrics, recentDocuments };
}
