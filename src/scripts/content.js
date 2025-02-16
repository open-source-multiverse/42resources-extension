
const PAGE_TYPE = { mine: 0, visitor: 1 }
/*
 this class is Provider all Resources from backend 
 */
class ResourcesProvider{
    cache = {}         
    constructor()
    {
        this.backendUrl = 'https://cdn-42resources.netlify.app/';
        this.TEXT = "json"
        this.JSON = "text"
    }

   async get(path, type)
    {
        // check if [path] is  in cache
        if(this.cache[path]) return this.cache[path];

        const url = `${this.backendUrl}${path}`
        const response = await  fetch(url);
          
                if (!response.ok) return  type === this.JSON ? {} :  "Not Found ❌";

                if (type === this.TEXT)
                    return await response.text();
                else
                    return await response.json();
            // .catch(error => console.error('Error loading HTML:', error, 'from URL:', url));   
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
        addButton(container, "More", `v1/en/corrections/${projectName}.html`, fetchCorrectionAndShowPanel)
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

async function  fetchCorrectionAndShowPanel(url)
{
    const  result  = await provider.get(url, provider.TEXT, showCorrectionsPanel);
    showCorrectionsPanel(result);

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

function showCorrectionsPanel(data)
{
    const view = provider.newView();
    view.innerHTML = data;
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

function jsonToQuestionsHtml(data) {
    let elements = [];

    let message = 'This question generated with AI, you can contribute to add more questions';
    if (Object.keys(data).length === 0) {
        message = "No Questions Here";
    }

    const messageElement = document.createElement('p');
    messageElement.classList.add('resource-container');
    messageElement.textContent = message;
    elements.push(messageElement);

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





