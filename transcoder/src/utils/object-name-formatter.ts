export type ParsedObjectName = {
  rawPath: string;
  fileName: string;
  baseName: string;
  extension: string;
};

/**
 * Fungsi murni untuk memecah nama file (object name) dari event MinIO
 */
export const parseObjectName = (objectName: string): ParsedObjectName => {
  const decodedName = decodeURIComponent(objectName);
  const pathParts = decodedName.split("/");
  const fileName = pathParts[pathParts.length - 1];
  const fileParts = fileName.split(".");
  
  let baseName = fileName;
  let extension = "";

  if (fileParts.length > 1) {
    extension = "." + fileParts.pop();
    baseName = fileParts.join(".");
  }

  return {
    rawPath: decodedName,
    fileName: fileName,
    baseName: baseName,
    extension: extension,
  };
};

