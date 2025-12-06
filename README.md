
Invoice-Data-Extraction-System/
├── backend/                    
│   ├── app/
│   │   ├── main.py           
│   │   ├── schemas.py        
│   │   ├── routes/           
│   │   ├── services/         
│   │   └── utils/            
│   ├── requirements.txt      
│   └── .env.example        
├── frontend/                 
│   ├── src/
│   │   ├── main.jsx         
│   │   ├── App.jsx           
│   │   ├── components/       
│   │   └── services/         
│   ├── package.json         
│   └── vite.config.js        
├── README.md                 
        


## Prerequisites

- Python 3.8+
- Node.js 16+ (for frontend)
- OpenAI API Key (get one at https://platform.openai.com)

To run the code, for the backend we need to create a virtual environment to install the requirements.txt and set the .env with the OpenAI key, then start Uvicorn on port 8000. To run the front end, install dependencies with npm install and then start the dev server with npm run dev. Once you do that, you can connect the API at http://localhost:8000.

I approached the problem with efficiency as always; the previous project helped me create this project in a smoother way. Create the backend with the virtual environment with the requirements, later I went to use cloude.ai to help with the structure of the backend. Went immediately to create the frontend to check out if the backend is working. Start debugging the issues that come up at the beginning until I get the app up and running. The only challenge with this project was the debugging thankfully. I had the experience of everything else. 

At the end, I started to test the app with different samples I found on google like the one I copy and paste before. Once the main requirements were completed, I continued to cover the bonus points and things I saw that weren’t of my liking. Finally, the app was kind of what I imagined and I liked it. About the key, I was paying for chat-gpt before, so the key was working well. It was fun.



Sample input

https://www.wmaccess.com/downloads/sample-invoice.pdf




