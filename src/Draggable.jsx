// Basic draggable item component
const Draggable = ({ word, count }) => {
    const handleDragStart = (e) => {
      e.dataTransfer.setData("text/plain", word);
    };
  
    return (
      <div draggable onDragStart={handleDragStart}>
        {word} ({count})
        <input type="checkbox" onChange={/* handle check to change styles */} />
      </div>
    );
  };
  