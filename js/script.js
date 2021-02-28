/**
 * Author   : Debojit Chakraborty
 * Date     : Feb-27, 2021
 */


const lexiconLink = 'https://raw.githubusercontent.com/justaRandomCoder/LeXicon/master/database/E2Bdatabase.json';
const base = 256; //for symbols in unicode
const prime =  999999999989; //12 digit prime

//Classes

//for handling the data from the json file
class Dictionary{
    size //total number of words
    words //english and bangla words in the json file
}

//for creating primary and secondary hash tables.
class PerfectHashing{
    firstHashA;
    firstHashB;
    hashtable;
    hashtableKeys;
    
    
    init(){
        console.log("start?");
        this.hashtable = new Array(dictionary.size);
        this.hashtableKeys = new Array(dictionary.size);
        
        for(var i = 0; i<dictionary.size;i++){
            this.hashtable[i] = []
            this.hashtableKeys[i] = []
        }
    }
    
    
    
    
    
    stringToKeyValue(string){
        //converts string to unique number
        var val = 0;
        for(var i=0; i< string.length;i++){
            val = ((val*base)%prime + string.charCodeAt(i))%prime;
        }
        return val;    
    }
    
    getPrimaryHashValue(key){
        //generates the key for primary hashing
        
        var a = BigInt(this.firstHashA);
        var b = BigInt(this.firstHashB);
        var hashresult = (a * BigInt(key) + b); // ak + b
        hashresult = hashresult % BigInt(prime); // ak + b mod p
        hashresult = Number(hashresult);
        return hashresult % (dictionary.size); //(ak+b)%p%m where m is the dictionary size.
    }
    
    isNotDuplicate(word, wordArray){
        //checks if word exists in array
        var unique = true;
        for(var i=0; i<wordArray.length; i++){
            if(dictionary.words[wordArray[i]].en == word){
                unique = false;
                break;
            }
        }

        return unique;
    }
    
    primaryHashTable(){
        //generates the primary hash table
        
        this.init();
        this.firstHashA = Math.floor(Math.random() * (prime - 1) ) + 1; // 1 to prime-1
        this.firstHashB = Math.floor(Math.random() * prime); //0 to prime-1
        
        for(var i =0 ; i< dictionary.size;i++){
            var word = dictionary.words[i].en.toLowerCase();
            var key = this.stringToKeyValue(word);
            var hashval = this.getPrimaryHashValue(key);
            if(this.isNotDuplicate(word,this.hashtable[hashval])){
                this.hashtable[hashval].push(i);
            }
        }
    }
    
    
    getSecondaryHashTable(wordArray, index){
        
        var m = wordArray.length; //n*n size array
        var secondHash = new Array(m*m);
        var a;
        var b;
        
        //checking for collission in the secondary hash table
        while(true){
            
            secondHash.fill(-1)
            var check = true 
            a = Math.floor(Math.random() * (prime - 1) ) + 1 // 1 to prime-1
            b = Math.floor(Math.random() * prime) // 0 to prime-1
            
            
            for(var i = 0; i < wordArray.length; i++){
                
                var key = this.stringToKeyValue(dictionary.words[wordArray[i]].en);
                a = BigInt(a);
                b = BigInt(b);
                key = BigInt(key);
                var hashValue = ((a*key)%BigInt(prime) + (b))% BigInt(prime); //(ak+b) %p
                hashValue = hashValue % BigInt(m); //(ak+b)%p%m
                hashValue = Number(hashValue);
                
                if(secondHash[hashValue] == -1){      
                    secondHash[hashValue] = wordArray[i];
                }    
                
                else{
                    check = false;
                    break;
                }
            
            }
            
            if(check == true){ 

                this.hashtableKeys[index][0] = Number(a);
                this.hashtableKeys[index][1] = Number(b);
                this.hashtableKeys[index][2] = Number(m);
                this.hashtable[index] = secondHash;
                break;
            }
        }
    }

    secondaryHash(){
        for(var i = 0; i < dictionary.size; i++){
            
            //  no collision in a slot
            if(this.hashtable[i].length == 1){
                this.hashtableKeys[i][0] = 1;
                this.hashtableKeys[i][1] = 0;
                this.hashtableKeys[i][2] = 1;
            } 
            //  collision in  a slot
            if(this.hashtable[i].length > 1){   
            
                var wordsInTheSameSlot = [];
                for(var j = 0; j < this.hashtable[i].length; j++){
                    wordsInTheSameSlot.push(this.hashtable[i][j]);
                }
                this.getSecondaryHashTable(wordsInTheSameSlot, i);
            }
        }
    }
    
    
    generateHash(){
          this.primaryHashTable();
          this.secondaryHash();  
    }
    

}


var hashx = new PerfectHashing();
var dictionary = new Dictionary();

window.onload = function getDictionary(){
    console.log('dictionary recieved')
    fetch(lexiconLink)
        .then(response => {
            if(!response.ok){
                throw new Error("Something went wrong " + response.status);
            }
            return response.json();
        })
        .then(json => {
            dictionary.words = json;
            dictionary.size = Object.keys(dictionary.words).length;
            console.log(dictionary.size);
            hashx.generateHash();
        })   
}

// function for clearing the text field
function clearTextField(){
    w = document.getElementById('searchword');
    var output = document.getElementById('output');
    if(w.value.length == 0) output.innerHTML = "";
    return;
}


//function for searching 
function search(){
    var w = document.getElementById('searchword');
    var output = document.getElementById('output');
    if(w.value.length == 0) {
        output.innerHTML = "";
        return ;
    }
    //calculating primaryhash
    w = w.value.toLowerCase();
    var key = hashx.stringToKeyValue(w);
    var primaryHash = hashx.getPrimaryHashValue(key);
    
    try{
        if(hashx.hashtableKeys[primaryHash] == undefined){
            output.innerHTML = "Word does not exist in dictionary";
            return;
        }
        
        //calculating secondaryhash
        var a = hashx.hashtableKeys[primaryHash][0];
        var b = hashx.hashtableKeys[primaryHash][1];
        var m = hashx.hashtableKeys[primaryHash][2];
        
        a = BigInt(a);
        b = BigInt(b);
        key = BigInt(key);
        
        var hashresult = ((a*key)%BigInt(prime) + (b))% BigInt(prime);
        hashresult = hashresult % BigInt(m);
        hashresult = Number(hashresult);
        var i = hashx.hashtable[primaryHash][hashresult];
        
        if(i >= 0 && (dictionary.words[i].en) == w){
            output.innerHTML = dictionary.words[i].bn;
            console.log(dictionary.words[i].bn);
        }
        else {
            output.innerHTML = "Word does not exist in dictionary";
            return;
        }
    }catch(err){
        output.innerHTML = "Word does not exist in dictionary";
    }
}

