import { useAuthStore } from "../stores/authStore";

// Use the environment variable if available, fallback to localhost for simulator testing
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Helper to make API requests with the authentication token automatically attached.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    // Fallback for Next.js endpoints that look for cookies
    headers.set("Cookie", `access_token=${token}`);
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Uploads a document using FormData
 */
export async function uploadDocument(fileUri: string, fileName: string, mimeType: string) {
  const formData = new FormData();
  
  // React Native FormData accepts an object with uri, name, and type for files
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await fetchApi("/api/documents/upload", {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type to multipart/form-data here, 
    // fetch will automatically set it with the correct boundary
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to upload document");
  }

  return response.json();
}

/**
 * Triggers processing for an uploaded document
 */
export async function processDocument(documentId: string, url: string) {
  const response = await fetchApi("/api/documents/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ documentId, url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to process document");
  }

  return response.json();
}

/**
 * Fetches dashboard metrics and recent documents
 */
export async function fetchDashboardData() {
  const response = await fetchApi("/api/dashboard", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch dashboard data");
  }

  return response.json();
}

/**
 * Fetches details for a single document
 */
export async function fetchDocumentDetails(id: string) {
  const response = await fetchApi(`/api/documents/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch document details");
  }

  return response.json();
}

/**
 * Updates details for a single document (e.g. verifying extracted data)
 */
export async function updateDocument(id: string, extractedData: Record<string, string>) {
  const response = await fetchApi(`/api/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ extractedData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update document");
  }

  return response.json();
}

/**
 * Fetches all documents with optional search and status filtering
 */
export async function fetchDocuments(params?: { search?: string; status?: string; type?: string }) {
  let url = '/api/documents';
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetchApi(url, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch documents");
  }

  return response.json();
}

/**
 * Deletes a document and its associated file blob
 */
export async function deleteDocument(documentId: string) {
  const response = await fetchApi(`/api/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete document");
  }

  return response.json();
}

/**
 * Re-runs the AI processing pipeline for an existing document
 */
export async function reprocessDocument(documentId: string) {
  const response = await fetchApi(`/api/documents/${documentId}/reprocess`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to reprocess document");
  }

  return response.json();
}

/**
 * Updates a document's classification type and re-runs extraction
 */
export async function updateDocumentType(documentId: string, documentType: string) {
  const response = await fetchApi(`/api/documents/${documentId}/type`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ documentType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update document type");
  }

  return response.json();
}
