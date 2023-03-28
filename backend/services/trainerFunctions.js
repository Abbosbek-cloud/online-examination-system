let QuestionModel = require("../models/questions");
let options = require("../models/option");
let tool = require("./tool");

let createQuestion = (req, res, next) => {
  if (req.user.type === "TRAINER") {
    req.check("body", `Invalid question!`).notEmpty();
    req.check("subject", "Enter subject!").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      res.json({
        success: false,
        message: "Invalid inputs",
        errors: errors,
      });
    } else {
      let body = req.body.body;
      let option = req.body.options;
      let quesimg = req.body.quesimg;
      let difficulty = req.body.difficulty;
      let subjectid = req.body.subject;
      let anscount = 0;
      let weightage = req.body.weightage;
      option.map((d, i) => {
        if (d.isAnswer) {
          anscount = anscount + 1;
        }
      });
      console.log(anscount);
      let explanation = req.body.explanation;
      QuestionModel.findOne({ body: body, status: 1 }, { status: 0 }).then(
        async (info) => {
          if (!info) {
            let optionsMany = await options.insertMany(option);
            if (optionsMany) {
              var ra = [];
              optionsMany.map((d, i) => {
                if (d.isAnswer) {
                  ra.push(d._id);
                }
              });
              var tempdata = await QuestionModel({
                body: body,
                explanation: explanation,
                quesimg: quesimg,
                subject: subjectid,
                difficulty: difficulty,
                options: optionsMany,
                createdBy: req.user._id,
                anscount: anscount,
                weightage: weightage,
                rightAnswers: ra,
              });
              tempdata
                .save()
                .then(() => {
                  res.json({
                    success: true,
                    message: `New question created successfully!`,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    success: false,
                    message: "Unable to create new question!",
                  });
                });
            } else {
              res.status(500).json({
                success: false,
                message: "Unable to create new question!",
              });
            }
          } else {
            res.status(400).json({
              success: false,
              message: `This question already exists!`,
            });
          }
        }
      );
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Permissions not granted!",
    });
  }
};

let deleteQuestion = async (req, res, next) => {
  if (req.user.type === "TRAINER") {
    var _id = req.body._id;
    await QuestionModel.findOneAndUpdate(
      {
        _id: _id,
      },
      {
        status: 0,
      }
    )
      .then(() => {
        res.json({
          success: true,
          message: "Question has been deleted",
        });
      })
      .catch((err) => {
        res.status(500).json({
          success: false,
          message: "Unable to delete question",
        });
      });
  } else {
    res.status(401).json({
      success: false,
      message: "Permissions not granted!",
    });
  }
};

let getAllQuestions = async (req, res, next) => {
  if (req.user.type === "TRAINER") {
    var subject = req.body.subject;
    if (subject.length !== 0) {
      let question = await QuestionModel.find(
        { subject: subject, status: 1 },
        { status: 0 }
      )
        .populate("createdBy", "name")
        .populate("subject", "topic")
        .populate("options")
        .exec();
      if (question) {
        res.status(200).json({
          success: true,
          message: `Success`,
          data: question,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Unable to fetch data",
        });
      }
    } else {
      let question = await QuestionModel.find({ status: 1 }, { status: 0 })
        .populate("createdBy", "name")
        .populate("subject", "topic")
        .populate("options")
        .exec();

      if (question) {
        res.status(200).json({
          success: true,
          message: `Success`,
          data: question,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Unable to fetch data",
        });
      }
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Permissions not granted!",
    });
  }
};

let getSingleQuestion = async (req, res, next) => {
  if (req.user.type === "TRAINER") {
    let _id = req.params._id;
    console.log(_id);
    let question = await QuestionModel.find(
      { _id: _id, status: 1 },
      { status: 0 }
    )
      .populate("body")
      .populate({ path: "subject", select: "topic" })
      .populate({ path: "createdBy", select: "name" })
      .populate("options")
      .exec();

    if (question) {
      res.status(200).json({
        success: true,
        message: `Success`,
        data: question,
      });
    } else {
      res.json({
        success: false,
        message: `No such question exists`,
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Permissions not granted!",
    });
  }
};

//create test papers

module.exports = {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  deleteQuestion,
};
