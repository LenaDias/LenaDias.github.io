import logo from './logo.svg';
import './App.css';

/*Event listeners*/
let images = document.querySelectorAll('.thumbnail');

images.forEach((item) => {
  item.addEventListener("mouseover", showTooltip);
});

function App() {
  return (
    <div className="App">
      <div id="left tooltip" className="grid-container">
        <div id="left toolgrid-item">
          test
        </div>
        <div id="left thumbnail" className="thumbnail-item">
          test
        </div>
        <div id="left branch" className="branch-item">
          test
        </div>
        <div id="trunk" className="trunk-item">
          <div className="tree-circle-outer">
            <div className="tree-circle-inner" />
          </div>
        </div>
        <div id="right branch" className="branch-item">
          <div className="tree-branch" />
        </div>
        <div id="right thumbnail" className="thumbnail-item">
          <img className="thumbnail" src="./images/logo192.png" />
        </div>
        <div id="right tooltip" className="grid-item">
          test
        </div>


        
      </div>
      
      
      
      
      
      
      
      {/*<div id="tree">
        <div id="tooltip-left" className ="tree-item">
        </div>
        <div id="thumbnail-left" className ="tree-item">
        </div>
        <div id="branch-left" className ="tree-item">
        </div>
        <div id="trunk" className ="tree-item">
          <div className="tree-circle-outer">
              <div className="tree-circle-inner"></div>
          </div>
        </div>
        <div id="branch-right" className ="tree-item">
          <div className="tree-branch right"></div>
        </div>
        <div id="thumbnail-right" className ="tree-item">
          <img className="thumbnail" src="./images/logo192.png" />
        </div>
        <div id="tooltip-right" className ="tree-item">
        </div>
        
        <div id="tooltip-left" className ="tree-item">
        </div>
        <div id="thumbnail-left" className ="tree-item">
        </div>
        <div id="branch-left" className ="tree-item">
        </div>
        <div id="trunk" className ="tree-item">
          <div className="tree-trunk"></div>
        </div>
        <div id="branch-right" className ="tree-item">
        </div>
        <div id="thumbnail-right" className ="tree-item">
        </div>
        <div id="tooltip-right" className ="tree-item">
        </div>
        {
        <div id="tooltip-left" className ="tree-item">
        </div>
        <div id="thumbnail-left" className ="tree-item">
        </div>
        <div id="branch-left" className ="tree-item">
          <div className="tree-branch left"></div>
        </div>
        <div id="trunk" className ="tree-item">
          <div className="tree-circle-outer">
              <div className="tree-circle-inner"></div>
          </div>
        </div>
        <div id="branch-right" className ="tree-item">
        </div>
        <div id="thumbnail-right" className ="tree-item">
        </div>
        <div id="tooltip-right" className ="tree-item">
        </div>
      </div>
        */}
    </div>
  );
}

function showTooltip() {
  console.log("ayo");
}

function changeDef(event){
  console.log("sup");
}

export default App;
