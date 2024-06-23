require("dotenv").config();
const path = require("path");
const {
  BlobServiceClient,
  BlobSASPermissions,
} = require("@azure/storage-blob");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");
const express = require("express");
const app = express();

app.use(bodyParser.json());

app.use(
  basicAuth({
    challenge: true,
    users: {
      [process.env.BASIC_AUTH_USERNAME]: process.env.BASIC_AUTH_PASSWORD,
    },
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static/index.html"));
});

app.post("/upload", async (req, res) => {
  try {
    const { size, lastModified, name } = req.body;
    const imageFolderPath = process.env.IMAGES_FOLDER_PATH;
    const uniqueBlobName = `${imageFolderPath}${Date.now()}_${lastModified}_${size}_${name}`;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME
    );

    const blobClient = containerClient.getBlobClient(uniqueBlobName);
    const blobPermissions = new BlobSASPermissions();

    blobPermissions.create = true;
    blobPermissions.write = true;

    const sasToken = await blobClient.generateSasUrl({
      permissions: blobPermissions,
      expiresOn: new Date(new Date().valueOf() + 5 * 60 * 1000),
    });

    res.json({
      uploadUrl: sasToken,
      blobName: uniqueBlobName,
    });
  } catch (error) {
    console.error("[/UPLOAD]:", error);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listeneing on port: ${process.env.PORT || 3000}`);
});
