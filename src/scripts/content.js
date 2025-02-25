
const PAGE_TYPE = { mine: 0, visitor: 1 }
/*

this class is Provider all Resources from backend 
 */

class ResourcesProvider{
    cache = {}
    what_next = "/what-next";
        
    constructor()
    {
        this.backendUrl = 'https://cdn-42resources.netlify.app/';
        this.TEXT = "json"
        this.JSON = "text"
        this.cache[this.what_next] = {
            "What Next": [
                "We need to improve the projects question.",
                "Please share any resources with us 📚.",
                "We need to add a backend to simplify sending resources or questions 💻.",
                "We need to share this extension 🔗.",
                "Add other project resources and questions (42 Advanced) 🛠️.",
                "Thanks for your effort. :( 🙏"
            ]
        }
        
    }

   async get(path, type)
    {
        // check if [path] is  in cache
        console.log(this.cache)
        if(this.cache[path]) return this.cache[path];

        const url = `${this.backendUrl}${path}`
        const response = await  fetch(url);
          
        if (!response.ok) return  type === this.JSON ? {} :  "Not Found ❌";
        let result= null;
        if (type === this.TEXT)
            result  = await response.text();
        else
             result = await response.json();
        this.cache[path] = result;
        return result;
    }
    
    newView()
    {
        const tempDiv           = document.createElement('div');
        const dimmedBackground  = document.createElement('div');
        dimmedBackground.id     = "dimmed-background";
        const panel             = document.createElement('div');
        panel.id                = "panel";
        const content           = document.createElement('div');
        content.id              = "content";

        panel.appendChild(content);
        tempDiv.appendChild(dimmedBackground);
        tempDiv.appendChild(panel);       
        dimmedBackground.onclick = () => 
        {
            document.body.removeChild(dimmedBackground);
            document.body.removeChild(panel);
        };
    
        document.body.appendChild(dimmedBackground);
        document.body.appendChild(panel);
         
        return content;
    }


build = (path) =>`${this.backendUrl}${path}`


}

class Init  {

    currentURL = null;

    onLoad() {
        this.currentURL = window.location.href;
        const loginSpan = document.querySelector("span[data-login]");

        let loginValue = null;
        try {
            loginValue = loginSpan ? loginSpan.dataset.login.trim() : null;
        }
        catch (error) {
            console.error(error);
        }

        if (this.currentURL.startsWith("https://projects.intra.42.fr/projects/")) {
            createUI(this.currentURL, PAGE_TYPE.visitor);
        } else if (this.currentURL.startsWith("https://projects.intra.42.fr") && (this.currentURL.endsWith("mine") || this.currentURL.endsWith(loginValue))) {
            createUI(this.currentURL, PAGE_TYPE.mine);
        }
    }
}

const init = new Init();
const provider = new ResourcesProvider();


document.addEventListener('DOMContentLoaded', init.onLoad);

function createUI(currentURL, type) 
{

    let container;
    let projectName;

    if (type === PAGE_TYPE.visitor) 
        {
        projectName = currentURL.split("/").pop();
        const headers = document.querySelectorAll("h4");
        headers.forEach(header =>{
        if (header.textContent.trim() === "Description")
        {
            container = header.closest('.project-desc-item');
        }
    });
    }
    else
    {
        projectName = currentURL.split("/")[3];
        container = document.querySelector(".project-summary-item").nextElementSibling;
    }

        console.log("before",projectName)
        projectName = projectName.replace("42cursus-","")
        console.log("after",projectName)
    if (container) 
    {

        addButton(container, "Resources", `v1/en/resources/${projectName}.json`, fetchResourcesAndShowPanel);
        addButton(container, "Questions", `v1/en/questions/${projectName}.json`, fetchDataAndShowPanel);
        addButton(container, "What next ?🤔", `/what-next`, fetchDataAndShowPanel)
    }
    else{
        console.log("container obs container not found");
    }

}



function addButton(parent, text, url, onClick) 
{
    const button = document.createElement("button");

    button.innerText = text;
    button.classList.add("btn", "btn-primary");
    button.title = `Click to see the ${text.toLowerCase()} of this project`;
    button.onclick = () => onClick(url);

    parent.appendChild(button);

}


async function  fetchDataAndShowPanel(url) 
{
    const  result  = await provider.get(url, provider.JSON);
     showPanel(result)
}


async function fetchResourcesAndShowPanel(url) 
{
    const  result  = await provider.get(url, provider.JSON);
    showResourcesPanel(result);
}



function showPanel(data)
{
    const view      = provider.newView();
    const result    = jsonToQuestionsHtml(data);
     result.forEach(child=>view.appendChild(child))
}

function showResourcesPanel(data)
{
    const view = provider.newView();
    const result   = jsonToResourcesHtml(data);
    result.forEach(child=>view.appendChild(child))
}



function jsonToResourcesHtml(data) {
    let elements = [];

    if (Object.keys(data).length === 0) {
        const messageElement = document.createElement('p');
        messageElement.classList.add('resource-container');
        messageElement.textContent = "No Resources Here";
        elements.push(messageElement);
    }

    for (let key in data) {
        if (key === "projectName") continue;

        const divider = document.createElement('div');
        divider.classList.add('title-divider');
        divider.textContent = key;
        elements.push(divider);

        data[key].forEach(item => {
            const resourceContainer = document.createElement('div');
            resourceContainer.classList.add('resource-container');

            const icon = document.createElement('img');
            icon.classList.add('icon');
            icon.alt = '';
            icon.src = provider.build("images/" + item.icon + '.svg');
            resourceContainer.appendChild(icon);

            const link = document.createElement('a');
            link.href = item.url;
            link.target = "_blank";
            link.classList.add('link');
            link.textContent = item.title;
            resourceContainer.appendChild(link);

            elements.push(resourceContainer);
        });
    }
    return elements;
}

function jsonToQuestionsHtml(data)
{
    let elements = [];

    if (Object.keys(data).length === 0) {
        message = "No Questions Here";
    }


    for (let key in data) {
        const divider = document.createElement('div');
        divider.classList.add('title-divider');
        divider.textContent = key;
        elements.push(divider);

        let index = 1;
        data[key].forEach(item => {
            const questionContainer = document.createElement('div');
            questionContainer.classList.add('resource-container');

            const indexElement = document.createElement('p');
            indexElement.classList.add('icon');
            indexElement.textContent = index;
            questionContainer.appendChild(indexElement);

            const questionElement = document.createElement('p');
            questionElement.textContent = item;
            questionContainer.appendChild(questionElement);

            elements.push(questionContainer);

            index += 1;
        });
    }
    return elements;
}