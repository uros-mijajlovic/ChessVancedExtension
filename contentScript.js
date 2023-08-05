

function movesToSEN(HTMLMoves){
    for(move of HTMLMoves){
        
        var whiteMove=move.children[0];
        
        var prefix=""
        if(whiteMove.children.length==1){
            prefix=whiteMove.firstChild.getAttribute('data-figurine')
        }
        console.log(prefix+whiteMove.textContent)

        //console.log(whiteMove, whiteMove.children.length, whiteMove.textContent);
    }

}
async function getMoves(){
    while(true){
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 100ms
        try{
            var moveContainer=document.querySelectorAll("vertical-move-list")[0]
            console.log("TST")
            if(moveContainer.children){
                
                movesToSEN(moveContainer.children);
                

            }
        }catch{
            console.log("nothing found")
        }
    }
}
console.log("KURWA");
getMoves();