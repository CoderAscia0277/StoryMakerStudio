
import { GoogleGenerativeAI } from "@google/generative-ai";

let prev_convo = [];
const genAI = new GoogleGenerativeAI("AIzaSyD0L0sE02V3kAwJXyNOSVg1rP3S6n5FgcE");
const gen_model = genAI.getGenerativeModel({ model: "gemini-pro" });
const chat = gen_model.startChat({
    generationConfig: {
        temperature:0.9,
        maxOutputTokens: 500
    },
  });
const chatGemini = async (message) => {

   try{
        let add_format = format(message,prev_convo)
        let res = await chat.sendMessage(add_format);
        res = await res.response;
        let json_response = JSON.parse(res.text());
        let author = json_response.AUTHOR_NAME;// gets the author name
        let summary = json_response.STORY_SUMMARY; // gets the story summary
        let bot_response = json_response.RESPONSE; // gets the AI response
        let user = {author:message};
        let bot = {'ISLA':bot_response};
        prev_convo.push(user);// add the user message to prev convo
        prev_convo.push(bot);// add the bot message to prev convo
        create_bot_message(bot_response);
   }catch{
        create_bot_message("Sorry, what was that again?");
   }
}
document.addEventListener('keydown',check_message);
function check_message(e){ // this function is triggered everytime a key is pressed
    let message = document.getElementById('message').value;
    let button = document.getElementById('send');
   
    if(e.code == "Enter"){
      send_message();
    }
    else if(message.length >= 5){
      button.style.opacity = 0.85;
    }
    else{
      button.style.opacity = 0.45;
    }
  
}
function send_message(){
    let button = document.getElementById('send');
    let message = document.getElementById('message').value;
    if(message.length >= 5){
       document.getElementById('chat_container').scrollTop = 1000;
       document.getElementById('message').value = "";
       button.style.opacity = 0.45;
       button.style.animation = "button_pulse 0.5s ease-in-out";
       create_user_message(message);
       
       setTimeout(()=>{ //reset the button animation so it can be use again
           button.style.animation = "";
       },500);
       
       setTimeout(()=>{// calls the loading function
           add_loading_message();
       },500);
       try{
         chatGemini(message);
       }
       catch{
        create_bot_message("Sorry an error has occured");
       }
     }
     else{
         return;
     }
 }
 document.getElementById('button').onclick = function() {
  send_message();
};

function create_user_message(message){ //this function creates a new message bubble for the user's input
    let chat_container = document.getElementById('chat_container'); // initialize the chat container
    let user_row = document.createElement('div');// creates a div for the user row
    user_row.className = "user_row"; // specify the class name for css styling and tagging
    let user_bubble = document.createElement('div'); // creates a user chat bubble from scratch
    user_bubble.id = "user_bubble"; //add tag to the user bubble for styling
    let text = document.createElement('p'); // creates a paragraph tag where the user text is located
    text.innerText = message; // adds message to the bubble
    user_bubble.appendChild(text);
    user_row.appendChild(user_bubble);
    chat_container.appendChild(user_row);
    chat_container.scrollTop = 1000;// this allows the content to scroll up automatically
}
function create_bot_message(message){ //this function creates a new message bubble for the AI
    let chat_container = document.getElementById('chat_container');
    chat_container.removeChild(document.getElementById('loading')); // this line removoes the loading dialogue
    let bot_row = document.createElement('div');
    bot_row.className = "bot_row";
    let bot_bubble = document.createElement('div');
    bot_bubble.id = "bot_bubble";
    let text = document.createElement('p');
    text.innerText = message; 
    bot_bubble.appendChild(text);
    bot_row.appendChild(bot_bubble);
    chat_container.appendChild(bot_row);
    chat_container.scrollTop = 1000; // this allows the content to scroll up automatically
}
function add_loading_message(){//this function create a loading dialogue for the AI response
    let chat_container = document.getElementById('chat_container');
    let bot_row = document.createElement('div');
    bot_row.className = "bot_row";
    bot_row.id = "loading";
    let bot_bubble = document.createElement('div');
    bot_bubble.id = "bot_bubble";
    let circle01 = document.createElement('div');
    let circle02 = document.createElement('div');
    let circle03 = document.createElement('div');
    circle01.id = "circle_load";
    circle02.id = "circle_load";
    circle03.id = "circle_load";
    circle01.style.animation = "blink_loading 2s ease-in-out 0s infinite";
    circle02.style.animation = "blink_loading 2s ease-in-out 0.5s infinite";
    circle03.style.animation = "blink_loading 2s ease-in-out 1s infinite";

    bot_bubble.appendChild(circle01);
    bot_bubble.appendChild(circle02);
    bot_bubble.appendChild(circle03);
    bot_row.appendChild(bot_bubble);
    chat_container.appendChild(bot_row);
    chat_container.scrollTop = 1000;
}
function format(message,prev_convo){
   const formatting = `
        #you're name is ASCII are  a virtual assistant specialized in asssisting story authors on their story writing
        # during the first interaction ASCII must politely introduce itself to the author, and the ask for the author's name and genre of story he wants to make
        #your job is to ask relevant questions, give suggest topics, plot twists,provide summary of the story the author is writing, learn more about the story, and give story telling suggestions
        # Once the author is ready to begin writing story, proceed to the main job 
        # if the author's response cannot be answered directly, politely decline his request
        # the output should be in JSON dictionary format which includes AUTHOR_NAME, it contains the name provided by the author, if name is unknown call him Aspiring Author, STORY_SUMMARY, it contains the story that ASCII and the author is working on. RESPONSE, it contains ASCII's response in the conversation
        # below is the Author's response to be evaluated by ASCII to provide relevant response
        ${message}
        #below are the previous conversation held by ASCII and the Author
        ${prev_convo}
   `;
   const prompt = `
        # you are ISLA or Interactive Self Learning Assistant
        # during the first interaction ISLA must politely introduce itself to the user, and the ask for the user's name and ask friendly topics about himself
        # your job is to accompany the your master, listen to his talks, give advise when necessary 
        # you are also eager to learn more about the user, ask relative questions about the users
        # if the user query is cannot be directly answered , politely decline the question
        # the output should be in JSON dictionary format which includes AUTHOR_NAME, it contains the name provided by the user, if name is unknown call him delightful user, STORY_SUMMARY, it contains the the word none and the author is working on. RESPONSE, it contains ISLA's response in the conversation
        # below is the Author's response to be evaluated by ASCII to provide relevant response
            ${message}
        #below are the previous conversation held by ASCII and the Author
            ${prev_convo}
  `;
   return prompt;
}





