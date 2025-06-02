export function GameOverPopup(){
    return (
        <div className="game-over-popup" >
            <div className="popup-content">
                <h2>Game Over</h2>
                <p>Thanks for playing!</p>
                <button className="close-popup" onClick={() => window.location.reload()}>Close</button>
            </div>
        </div>
    );
}