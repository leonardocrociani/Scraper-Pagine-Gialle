// autoexecutable scrape function

(async function scrape () {
    const ELS = document.querySelectorAll('.search-itm');
    console.log('Found '+ELS.length+' candidates.');
    
    let result = [];
    let ragioni_sociali = [];

    // data loading

    let previous_data = localStorage.getItem('pg_scraped');
    if (previous_data !== null) {
        const parsed = JSON.parse(previous_data);
        console.log('Found some data! -> '+parsed.length)
        result = [...parsed];
        ragioni_sociali = parsed.map(el => el.ragione_sociale + el.tel);
    }    

    // helper function to load every result in the page

    const openResult = async () => {
        var iteration = 0;
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        while (iteration < 8) {
            const next_btn = document.querySelector('.next-page-btn');
            if (!next_btn) break;
            else next_btn.click();
            await sleep(2000);
            console.log('waiting...');
            iteration++;
        }   
    } 

    await openResult();

    // execution

    var i=0;

    for (const el of ELS) {
        ++i;
        try {
            var tel = el.querySelector('.search-itm__icoTel').parentElement.childNodes[1].textContent;
            var [regione, via, cap, paese] = el.querySelector('.search-itm__adr').innerHTML.match(/<.*?>(.*?)<\/.*?>/g).map(x => x.match(/>(.*?)</g)[0].trim().substring(1, x.match(/>(.*?)</g)[0].length - 1).trim());
            var ragione_sociale = el.querySelector('h2').innerHTML.trim();
    
            if (!ragioni_sociali.includes(ragione_sociale + tel)) {
                result.push(
                    {
                        ragione_sociale, 
                        tel, via, cap, paese, regione
                    }    
                );
                ragioni_sociali.push(ragione_sociale + tel);
            }
        }
        catch(e) {
            console.log('error with element '+i);
        }
    }

    // data saving and results

    localStorage.setItem('pg_scraped', JSON.stringify(result))
    console.log('Done!');
    console.log('New length -> '+result.length)

    // possibility to save data in the clipboard

    const button = document.createElement('button');
    button.innerHTML = 'Save'; 
    button.onclick = () => navigator.clipboard.writeText(JSON.stringify(result));
    document.body.appendChild(button);
})()