import React, { useState, useEffect } from 'react';

const TextContainer = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('path_to_content.txt')
      .then(res => res.text())
      .then(data => {
        // Parse and set data
        setContent(data);
      });
  }, []);

  return (
    <section id="text">
    <h2>Drag and drop the tag names into the text representing an HTML document.</h2>
    <div id="text-container">    
    <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
    {/* <button className="primary-btn" onClick=function to check answers>Check</button> */}
    <button className="primary-btn">Check</button>
    <div id="score-display">Score: <span id="score"></span></div>
  </section>

  );
};

export default TextContainer;