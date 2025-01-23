
const PAGE_TYPE = { mine: 0, visitor: 1 }
/*
 this class is Provider all Resources from backend 
 */
class ResourcesProvider{
    cache = {}     
    injectedHtml =`<div id="dimmed-background"></div><div id="panel"><div id="content"></div></div>`;
    
    constructor()
    {
        this.backendUrl = 'https://cdn-42resources.netlify.app/';
        this.TEXT = "json"
        this.JSON = "text"
    }

    get(path, type, callback)
    {
        // check if [path] is  in cache
        if(this.cache[path])
        {
                return callback(this.cache[path])
        } 

        const url = `${this.backendUrl}${path}`
        fetch(url)
            .then(response => {

                if (!response.ok)
                {
                    return  type === this.JSON ? {} :  "Not Found ❌";

                }
                
                if (type === this.TEXT)
                {
                    return response.text();
                }
                else{
                    return response.json();
                }
            })
            .then(data => {
                this.cache[path] = data // save data as cache  
                callback(data);
            })
            .catch(error => console.error('Error loading HTML:', error, 'from URL:', url));

   
    }

    loadHTML(callback)
{
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = this.injectedHtml;
                callback(tempDiv);
          
    }

build(path)
{
    return  `${this.backendUrl}${path}`
}

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

function createUI(currentURL, type) {

    let container;
    let projectName;

    if (type === PAGE_TYPE.visitor) {
        projectName = currentURL.split("/").pop();
        const headers = document.querySelectorAll("h4");
        headers.forEach(header => {
            if (header.textContent.trim() === "Description") {
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
    if (container) {

        addButton(container, "Resources", `v1/en/resources/${projectName}.json`, fetchResourcesAndShowPanel);
        addButton(container, "Questions", `v1/en/questions/${projectName}.json`, fetchDataAndShowPanel);
        addButton(container, "More", `v1/en/corrections/${projectName}.html`, fetchCorrectionAndShowPanel
        )
    }
    else{
        console.log("container obs container not found");
    }

}



function addButton(parent, text, url, onClick) {
    const button = document.createElement("button");

    button.innerText = text;
    button.classList.add("btn", "btn-primary");
    button.title = `Click to see the ${text.toLowerCase()} of this project`;
    button.onclick = () => onClick(url);

    parent.appendChild(button);

}


function fetchDataAndShowPanel(url) {
    provider.get(url, provider.JSON, showPanel);
}


function fetchResourcesAndShowPanel(url) {
    provider.get(url, provider.JSON, showResourcesPanel);
}

function  fetchCorrectionAndShowPanel(url)
{
    provider.get(url, provider.TEXT, showCorrectionsPanel);
}

function showPanel(data)
{ 
    provider.loadHTML((tempDiv) => {
        show(tempDiv, data, jsonToQuestionsHtml);
    });
}

function show(root, data, callback)
{
    const dimmedBackground   =  root.querySelector('#dimmed-background');
    const panel              =  root.querySelector('#panel');
    const contentElement     =  panel.querySelector('#content');

    dimmedBackground.onclick = () => {
        document.body.removeChild(dimmedBackground);
        document.body.removeChild(panel);
    };

    document.body.appendChild(dimmedBackground);
    document.body.appendChild(panel);

    contentElement.innerHTML = callback(data)


}

function showResourcesPanel(data)
{
    provider.loadHTML((tempDiv) => {
        show(tempDiv, data, jsonToResourcesHtml);
    });
}

function showCorrectionsPanel(data)
{
    provider.loadHTML((tempDiv) => {
        show(tempDiv, data, (data)=>{

            return data;
        });
    });
}

function jsonToResourcesHtml(data)
{
    let html = '';

    if (Object.keys(data).length === 0)
    {
        html = `<p class="resource-container">No Resources Here<p><br>`;
    }

    for (let key in data) 
    {
        if(key === "projectName") // this projectName because it's a string
            continue;

        html += ` <div class="title-divider">${key}</div>`
        for (let item of data[key]) {

            html += `<div class="resource-container">
                 <img  class="icon" alt="" src="${provider.build("images/" + item.icon + '.svg')}">
                <a href="${item.url}" target="_blank" style="color:#fff" class='link'>${item.title}</a>
                 </div>`
        }

    }
    return html;
}


function jsonToQuestionsHtml(data) {
    
    let message = 'this question generated with AI,you can contribute to add more questions'
    
    if (Object.keys(data).length === 0)
    {
        message = "No Questions Here";
    }

    let html = `<p class="resource-container">${message}<p><br>`;

    for (let key  in data) 
        {
        html += ` <div class="title-divider">${key}</div>`
        let index = 1;
        for (let item of data[key])
        {

            html += `<div class="resource-container">
                <p class="icon" >${index}<p>
                <p>${item}</p>
                </div>`
            index += 1;
        }

    }
    return html;
}
