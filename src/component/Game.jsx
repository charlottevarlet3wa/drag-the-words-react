import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

function Game() {
  const [inputs, setInputs] = useState({});
  const [expectedAnswers, setExpectedAnswers] = useState({});
  const [inputClasses, setInputClasses] = useState({});
  const [score, setScore] = useState(0);
  const [draggables, setDraggables] = useState([]);
  const [elements, setElements] = useState([]); // To store parsed elements
  const [initialText, setInitialText] = useState(''); // Save the initial text
  const [totalInputs, setTotalInputs] = useState(0);

  let { textId } = useParams();
  console.log("textId :");
  if(textId === undefined) {textId = 1};
  console.log(textId);

  const shuffleArray = (array) => {
    const shuffledArray = array.slice(); // Create a copy of the array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const handleInputChange = (e, id) => {
    const { value } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: value
    }));
  };

  useEffect(() => {
    // fetch('/texts/text-1.txt')
    fetch(`/texts/text-${textId}.txt`)
      .then(response => response.text())
      .then(text => {
        setInitialText(text); // Save the initial text
        const wordCounts = {};
        const matches = text.match(/\*([^*]+)\*/g) || [];
        let parsedElements = parseTextToElements(text);
        
        matches.forEach((match, index) => {
          const word = match.replace(/\*/g, '').trim();
          wordCounts[word] = (wordCounts[word] || 0) + 1;
          expectedAnswers[`input-${index}`] = word;
        });

        const draggablesArray = Object.entries(wordCounts).map(([word, count]) => ({ word, count }));
        setDraggables(shuffleArray(draggablesArray));
        setExpectedAnswers(expectedAnswers);
        setElements(parsedElements);
        setTotalInputs(matches.length);
      })
      .catch(error => console.error('Failed to load content:', error));
  }, []);

  const handleDragStart = (e, value) => {
    e.dataTransfer.setData("text/plain", value);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, inputId) => {
    e.preventDefault();
    const value = e.dataTransfer.getData("text/plain");
    e.target.value = value;
    setInputs(prev => ({
      ...prev,
      [inputId]: value
    }));
  };
  const calculateScore = () => {
    let newScore = 0;
    let newInputClasses = {};
  
    Object.keys(inputs).forEach(key => {
      if (inputs[key] === expectedAnswers[key]) {
        newScore++;
        newInputClasses[key] = 'correct';
      } else if (inputs[key]) {
        newInputClasses[key] = 'incorrect';
      }
    });
  
    setScore(newScore);
    setInputClasses(newInputClasses);
  
    // Update elements with new classes immediately
    setElements(parseTextToElements(initialText, newInputClasses));
  };
  

  const parseTextToElements = (text) => {
    let elements = [];
    let index = 0;
    let inputIndex = 0;

    const bracketsOrNot = [...text.matchAll(/(<[^>]*>|[^<>]+|\n+)/g)];

    bracketsOrNot.forEach(match => {
      const bracketOrNot = match[0];

      if (bracketOrNot === '\n') {
        elements.push(<br key={`br-${index++}`} />);
      } else if (bracketOrNot.startsWith('<') && bracketOrNot.endsWith('>')) {
        const stars = bracketOrNot.split(/(\*\w+\*)/);
        stars.forEach((star) => {
          if (star.startsWith('*') && star.endsWith('*')) {
            const inputId = `input-${inputIndex}`;
            elements.push(
              <input 
                key={inputId}
                id={inputId}
                type="text"
                onChange={(e) => handleInputChange(e, inputId)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, inputId)}
                value={inputs[inputId] || ''}
                // placeholder={star.slice(1, -1)}
                className={inputClasses[inputId] || ''}
              />
            );
            inputIndex++;
          } else {
            const greysOrNot = [...star.matchAll(/(<!?\/?\w+)|(<!?\/?)|(>)|([^<>]+)/g)];
            greysOrNot.forEach((greyOrNot) => {
              if (greyOrNot[1]) {
                const bracketsOrNotInGrey = [...greyOrNot[1].matchAll(/(<!?\/?)(\w+)/g)][0];
                elements.push(<span className='code-grey' key={index++}>{bracketsOrNotInGrey[1]}</span>);
                elements.push(<span className='code-blue' key={index++}>{bracketsOrNotInGrey[2]}</span>);
              } else if (greyOrNot[2]) {
                elements.push(<span className='code-grey' key={index++}>{greyOrNot[2]}</span>);
              } else if (greyOrNot[3]) {
                elements.push(<span className='code-grey' key={index++}>{greyOrNot[3]}</span>);
              } else if (greyOrNot[4]) {
                const attributes = Array.from(greyOrNot[4].matchAll(/(\s\w+)(=)("[^"]+")|(\s\w+)|(="[^"]+)|([^"]+")|(=)|(")/g));
                attributes.forEach(attribute => {
                  if(attribute[0] === "="){
                    elements.push(<span className='code-black' key={index++}>{attribute[0]}</span>);
                  } else if (attribute[0] === '"'){
                    elements.push(<span className='code-orange' key={index++}>{attribute[0]}</span>);
                  } else if (!(attribute[0].includes("=") || attribute[0].includes('"'))){
                    elements.push(<span className='code-blue' key={index++}>{attribute[0]}</span>);
                  } else if(/^(="[^"]+)/.test(attribute[0])){
                    elements.push(<span key={index++}>
                      <span style={{color:"black"}}>=</span>
                      <span className='code-orange'>"{attribute[0].slice(2)}</span></span>);
                  } else if(/(\w+="[^"]")/){
                    elements.push(<span className='code-green' key={index++}>{attribute[1]}</span>);
                    elements.push(<span className='code-black' key={index++}>{attribute[2]}</span>);
                    elements.push(<span className='code-orange' key={index++}>{attribute[3]}</span>);
                  } else if(/([^"\s]+")$/.test(attribute[0])){
                    elements.push(<span key={index++}>
                    <span style={{color: "orange"}} >{attribute[0].slice(0, -1)}"</span></span>);
                  }
                });
              }
            });
            index++;
          }
        });
      } else {
        const stars = bracketOrNot.split(/(\*[^\*]+\*)/);
        stars.forEach((star) => {
          if (star.startsWith('*') && star.endsWith('*')) {
            const inputId = `input-${inputIndex}`;
            elements.push(
              <input 
                key={inputId}
                id={inputId}
                type="text"
                onChange={(e) => handleInputChange(e, inputId)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, inputId)}
                value={inputs[inputId] || ''}
                // placeholder={star.slice(1, -1)}
                className={inputClasses[inputId] || ''}
              />
            );
            inputIndex++;
          } else {
            elements.push(<span key={index++}>{star}</span>);
          }
        });
      }
    });

    return elements;
  };

  return (
      <div className="game">
        <section className='text-container'>
          <div className='text'>
            {elements}
          </div>
          <div className="score-container">
            <button className="score-btn" onClick={calculateScore}>Check Score</button>
            <div>Score: {score}/{totalInputs}</div>
          </div>
        </section>
        <section className='words'>
          {draggables.map(({ word, count }, i) => (
            <div key={i} draggable="true" onDragStart={(e) => handleDragStart(e, word)} className="draggable">
              {word} ({count})
            </div>
          ))}
        </section>
      </div>
  );
}

export default Game;
