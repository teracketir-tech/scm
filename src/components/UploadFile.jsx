import { Button, Upload } from "antd";
import axios from "axios";
import localforage from "localforage";
import React, { useEffect, useState } from "react";
export const UploadFile = ({
  listType = "picture",
  accept,
  multiple,
  maxCount = 1,
  name,
  onChange,
  value,
}) => {
  // console.log(value);
  const [file, setfile] = useState("");
  const [fileList, setFileList] = useState([]);
  const customRequest = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;

    const formData = new FormData();
    formData.append("file", file);
    const token = await localforage.getItem("token");

    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BE_URL}/settings/upload`,
        formData,
        {
          headers: headers,
          onUploadProgress: (event) => {
            const percent = (event.loaded / event.total) * 100;
            onProgress({ percent });
          },
        }
      );
      if (response.data.status === "success") {
        onSuccess(response.data, file);
        onChange(response.data.name);
      } else onError(response.data);
    } catch (err) {
      onError(err);
    }
  };
  useEffect(() => {
    if (value) {
      setFileList([
        {
          uid: "-1",
          name: value,
          status: "done",
          url: `https://puladir-api.avishost.com/v1/settings/resize-image/${value}/auto/auto`,
          type: value.split(".")[1],
        },
      ]);
    }
  }, [value]);
  const handleUploadChange = (info) => {
    let fileList = [...info.fileList];
    // Remove successfully uploaded files from the list
    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.status === "error";
      }
      return true;
    });
    setFileList(fileList);
  };
  return (
    <Upload
      customRequest={customRequest}
      listType={listType}
      accept={accept}
      multiple={multiple}
      maxCount={maxCount}
      name={name}
      fileList={fileList}
      onRemove={(e) => {
        onChange(null);
        setFileList([]);
      }}
      onChange={handleUploadChange}
    >
      <Button type="default">
        <span>برای آپلود فایل کلیک کنید</span>
      </Button>
      {/* {value ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton} */}
    </Upload>
  );
};
