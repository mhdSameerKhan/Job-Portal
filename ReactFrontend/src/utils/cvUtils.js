/**
 * Utility function to handle CV viewing and downloading
 * - PDFs: Opens in a new tab for viewing in browser
 * - Other files (docx, doc, etc.): Downloads to user's device
 * 
 * @param {string} cvUrl - The URL of the CV file
 * @returns {Promise<void>}
 */
export const handleCVView = async (cvUrl) => {
  if (!cvUrl) {
    console.error("No CV URL provided");
    alert("CV file is not available");
    return;
  }

  try {
    // Construct full URL if it's a relative path
    let fullUrl = cvUrl;
    if (!cvUrl.startsWith('http://') && !cvUrl.startsWith('https://')) {
      // Extract base URL from API_BASE_URL or use default
      // API_BASE_URL is typically "http://localhost:3001/api", so we need to remove "/api"
      const apiBaseUrl = "http://localhost:3001/api";
      const baseUrl = apiBaseUrl.replace('/api', '');
      // Ensure we don't have double slashes
      const cleanPath = cvUrl.replace(/^\//, '');
      fullUrl = `${baseUrl}/${cleanPath}`;
    }

    console.log("Fetching CV from URL:", fullUrl);

    // Get auth token from localStorage
    let authHeaders = {};
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.access) {
          authHeaders['Authorization'] = `Bearer ${user.access}`;
        }
      }
    } catch (error) {
      console.warn("Could not get auth token:", error);
    }

    // Fetch the file as a blob
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: authHeaders
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Determine file type from blob or URL
    const contentType = blob.type || response.headers.get('content-type') || '';
    const urlLower = fullUrl.toLowerCase();
    
    // Check if it's a PDF
    const isPDF = contentType.includes('application/pdf') || 
                 contentType.includes('pdf') ||
                 urlLower.endsWith('.pdf');
    
    // Check if it's a document that should be downloaded
    const isDocument = contentType.includes('application/msword') ||
                       contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
                       contentType.includes('wordprocessingml') ||
                       urlLower.endsWith('.doc') ||
                       urlLower.endsWith('.docx');

    if (isPDF) {
      // For PDFs: Open in new tab for viewing
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      
      // Clean up the blob URL after a delay (browser will handle it, but this is good practice)
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } else {
      // For other files (docx, doc, etc.): Download
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Extract filename from URL or use default
      const urlParts = fullUrl.split('/');
      let filename = urlParts[urlParts.length - 1].split('?')[0];
      
      // If no extension, try to determine from content type
      if (!filename.includes('.')) {
        if (isDocument) {
          filename = filename || 'CV.docx';
        } else {
          filename = filename || 'CV';
        }
      }
      
      // Create temporary anchor element for download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    }
  } catch (error) {
    console.error("Error handling CV view:", error);
    alert(`Failed to open CV: ${error.message}. Please try again.`);
  }
};

