import axios from "axios";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useHistory } from "react-router-dom";
import EditorToolbar, { formats, modules } from "./EditorToolbar";
import "./TextEditor.css";

const urlPattern = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

function base64ToFile(url, i) {
  let arr = url.split(",");
  // console.log(arr)
  let mime = arr[0].match(/:(.*?);/)[1];
  let data = arr[1];

  let dataStr = atob(data);
  let n = dataStr.length;
  let dataArr = new Uint8Array(n);

  while (n--) {
    dataArr[n] = dataStr.charCodeAt(n);
  }

  let file = new File([dataArr], `File_${i}.jpg`, { type: mime });

  return file;
}

function Add() {
  let history = useHistory();
  const [userInfo, setuserInfo] = useState({
    title: "",
    description: "",
    information: "",
  });
  const onChangeValue = (e) => {
    setuserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };
  const ondescription = (value) => {
    console.log(value);

    // Regex bắt src của img
    // matches là array chứa src
    const matches = value.match(/<img [^>]*src="[^"]*"[^>]*>/gm)
                          .map(x => x.replace(/.*src="([^"]*)".*/, '$1'));
    console.log(matches);
    // Loop qua mảng match chứa src để convert sang jpg
    for (let i = 0; i < matches.length; i++) {
      // console.log(matches[i]);

      // Check nếu khác link URL thì vào if
      if(!urlPattern.test(matches[i])){
        // console.log(true);
        matches[i] = base64ToFile(matches[i], i)
      }
    }

    // Kết quả sau khi convert xong
    console.log("\n\nAFTER convert to File");    
    
    // Array chứa cả link Url và File jpg 
    console.log(matches);

    // Array chỉ File jpg 
    const filteredURLArr = matches.filter((element) => !urlPattern.test(element));
    console.log(filteredURLArr); 

    setuserInfo({ ...userInfo, description: value });
  };
  const oninformation = (value) => {
    setuserInfo({ ...userInfo, information: value });
  };
  const [isError, setError] = useState(null);
  const addDetails = async (event) => {
    try {
      event.preventDefault();
      event.persist();
      if (userInfo.description.length < 50) {
        setError("Required, Add description minimum length 50 characters");
        return;
      }
      axios
        .post(`http://localhost:8080/addArticle`, {
          title: userInfo.title,
          description: userInfo.description,
          information: userInfo.information,
        })
        .then((res) => {
          if (res.data.success === true) {
            history.push('/')
          }
        })
    } catch (error) {
      throw error
    }
  }

  const onSelectionChange = (range, oldRange, source) => {
    console.log(oldRange)
  }

  return (
    <>
      <div className="App">
        <div className="container">
          <div className="row">
            <form onSubmit={addDetails} className="update__forms">
              <h3 className="myaccount-content"> Add </h3>
              <div className="form-row">
                <div className="form-group col-md-12">
                  <label className="font-weight-bold">
                    {' '}
                    Title <span className="required"> * </span>{' '}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={userInfo.title}
                    onChange={onChangeValue}
                    className="form-control"
                    placeholder="Title"
                    required
                  />
                </div>
                <div className="clearfix"></div>
                <div className="form-group col-md-12 editor">
                  <label className="font-weight-bold">
                    {' '}
                    Description <span className="required"> * </span>{' '}
                  </label>
                  <EditorToolbar toolbarId={'t1'} />
                  <ReactQuill
                    theme="snow"
                    value={userInfo.description}
                    onChange={ondescription}
                    placeholder={'Write something awesome...'}
                    modules={modules('t1')}
                    // formats={formats}
                  />
                </div>
                <br />
                <div className="form-group col-md-12 editor">
                  <label className="font-weight-bold">
                    {' '}
                    Additional Information{' '}
                  </label>
                  <EditorToolbar toolbarId={'t2'} />
                  <ReactQuill
                    theme="snow"
                    value={userInfo.information}
                    onChange={oninformation}
                    placeholder={'Write something awesome...'}
                    modules={modules('t2')}
                    formats={formats}
                    onChangeSelection={onSelectionChange}
                  />
                </div>
                <br />
                {isError !== null && <div className="errors"> {isError} </div>}
                <div className="form-group col-sm-12 text-right">
                  <button type="submit" className="btn btn__theme">
                    {' '}
                    Submit{' '}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
export default Add
