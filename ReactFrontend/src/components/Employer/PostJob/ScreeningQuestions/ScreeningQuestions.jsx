import React, { useState } from "react";
import "./ScreeningQuestions.css";

const ScreeningQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="screening-questions">
      <label>Add Screening Questions</label>
      <div className="questions-list">
        {questions.map((question, index) => (
          <div key={index} className="question-item">
            <span>{question}</span>
            <button onClick={() => removeQuestion(index)}>×</button>
          </div>
        ))}
      </div>
      <div className="add-question">
        <input
          type="text"
          placeholder="Enter a screening question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <button onClick={addQuestion}>Add</button>
      </div>
    </div>
  );
};

export default ScreeningQuestions;
