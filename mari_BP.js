// ==UserScript==
// @name         [mari] Blue Panel - Super Subcampaigns, Tech Tools, Reports Navigation Menu
// @namespace    https://campaigns.rtbhouse.biz/
// @version      2.00.mari
// @description  Adds Automation, Subcampaign, Tech Tools, External Links and Reports Menus in the Blue Panel
// @author       Mariana Porto
// @match        https://campaigns.rtbhouse.biz/*
// @icon         https://www.google.com/s2/favicons?domain=rtbhouse.com
// @updateURL    https://raw.githubusercontent.com/mariporto13/work/main/mari_BP.js
// @downloadURL  https://raw.githubusercontent.com/mariporto13/work/main/mari_BP.js
// @exclude      https://campaigns.rtbhouse.biz/tagging/*
// @exclude      https://campaigns.rtbhouse.biz/users*
// @exclude      https://campaigns.rtbhouse.biz/start*
// @exclude      https://campaigns.rtbhouse.biz/#/activity*
// @run-at       document-end
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_listValues
// @grant GM_registerMenuCommand
// @grant window.onurlchange

// ==/UserScript==
unsafeWindow.GM_listValues = GM_listValues;
unsafeWindow.GM_getValue = GM_getValue;
let ttLinks = GM_getValue("ttLinks");
let reportLinks = GM_getValue("reportLinks");
let automationLinks = GM_getValue("automationLinks");
let externalLinks = GM_getValue("externalLinks");

if (!ttLinks) {
    ttLinks = `[
['Swappables Manager', '/swappables-manager'],
['Static banners creator', '/creatives-creator'],
['Creatives recycler', '/creatives-recycler'],
['Clients stats', '/client-stats/overview'],
['Clients stats - update', '/client-stats-manual-update'],
['Access logs preview', '/access-logs-preview/requests'],
['Incoming tags config', '/tags-mapping'],
['David vs Goliath', '/david-vs-goliath'],
['Order forms', '/order-forms'],
['Traffic forms', '/traffic-forms'],
['In-app click tester', '/click-tester']
]`;
}

if (!reportLinks) {
    reportLinks = `[
['Daily Stats', '/daily-stats'],
['Top Hosts', '/top-hosts'],
['Subcampaign Stats', '/campaign-stats'],
['Conversions', '/conversions'],
['Bid Stats Hourly', '/bid-stats-hourly'],
['Tags Count', '/user-tags']
]`;
}

if (!automationLinks) {
    automationLinks = `[
    ['dCPC - Editor', '/jobs/136/params/form'],
    ['dCPC - Audit Log','/jobs/136/history'],
    ['Pacer - Editor','/jobs/153/params/form'],
    ['Pacer - Audit Log','/jobs/153/history']
    ]`;
}

if (!externalLinks) {
    externalLinks = `[
['Hourly Stats Dashboard', 'bf621f67-b452-4a91-9979-136714ec5798'],
['CTR analysis - red and orange flags', 'f7a9c6b8-8426-42e7-8a03-f6186124775d']
]`;
}

setUserPref('ttLinks', ttLinks, "Set Tech Tools links", "Enter all links as an 2D-Array ([ ['Link Title','/relative-link/'] ])");
setUserPref('reportLinks', reportLinks, "Set Reports links", "Enter all links as an 2D-Array ([ ['Link Title','/relative-link/'] ])");
setUserPref('automationLinks', automationLinks, "Set Automation links", "Enter all links as an 2D-Array ([ ['Link Title','/relative-link/'] ])");
setUserPref('externalLinks', externalLinks, "Set External links", "Enter all links as an 2D-Array ([ ['Link Title','/relative-link/'] ])");

ttLinks = JSON.parse(ttLinks.replace(/'/g, '"'));
reportLinks = JSON.parse(reportLinks.replace(/'/g, '"'));
automationLinks = JSON.parse(automationLinks.replace(/'/g, '"'));
externalLinks = JSON.parse(externalLinks.replace(/'/g, '"'));

function setUserPref(varName, defaultVal, menuText, promtText) {
    GM_registerMenuCommand(menuText, () => {
        const val = prompt(promtText, GM_getValue(varName, defaultVal));
        if (val === null) {
            return;
        }
        GM_setValue(varName, val);
        location.reload();
    });
}

(async () => {

    /**const urlWithHash = () => {
        return document.location.href.indexOf("#") > -1;
    }*/

    const getAdvertiserId = () => {
        return document.location.href.match(/(?<=advertisers\/).*/)[0].split("/")[0];
    }

    const showMenu = id => {
        if (document.querySelector(`#${id}`)) {
            document.querySelector(`#${id}`).classList.add('active');
            document.querySelector(`#${id} a`).classList.add('active');
            document.querySelector(`#${id}`).classList.add('visible');
            document.querySelector(`#${id}`).setAttribute('aria-expanded', 'true');
            document.querySelector(`#${id} div.menu`).classList.add('active');
            document.querySelector(`#${id} div.menu`).classList.add('visible');
        }
    }
    const hideMenu = id => {
        if (document.querySelector(`#${id}`)) {
            document.querySelector(`#${id}`).classList.remove('active');
            document.querySelector(`#${id} a`).classList.remove('active');
            document.querySelector(`#${id}`).classList.remove('visible');
            document.querySelector(`#${id}`).setAttribute('aria-expanded', 'true');
            document.querySelector(`#${id} div.menu`).classList.remove('active');
            document.querySelector(`#${id} div.menu`).classList.remove('visible');
        }
    }
    const toggleMenu = id => {
        if (document.querySelector(`#${id}`) && document.querySelector(`#${id}`).classList.contains('active')) {
            hideMenu(id);
        } else {
            showMenu(id);
        }
    }
    //if (!urlWithHash()) {
        window.addEventListener('mouseup', e => {
            const targets = ['subcampaigns', 'techtools', 'reports'];
            targets.forEach(target => {
                if (event.target != document.querySelector(`#${target}`)) {
                    hideMenu(target);
                }
            });
        });
    //}

    const generateElements = html => {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.children;
    }

    const generateChildLink = (title, url, backgroundcolor, target = '_blank') => {
        const child = `<li class="k-item k-state-default" role="menuitem"><a class="k-link" target="${target}" style="color:${backgroundcolor}!important" href="${url}">${title}</a></li>`;
        return generateElements(child)[0];
    }

    const generateParentLink = (title, url, specialClass, target = '_blank') => {
        const parent = `<li id="${specialClass}" class="k-item k-state-default" role="menuitem" aria-haspopup="true" style="z-index: auto;">
	<span class="k-link"><a target="${target}" class="k-link" style="color:#395c75" href="${url}">${title}</a><span class="k-icon  k-i-arrow-60-down"></span></span>
        <div class="k-animation-container" style="width: 204px; height: 358px; overflow: hidden; display: none; position: absolute; z-index: 10002; top: 36.0048px; left: 0px; box-sizing: content-box;">
            <ul class="k-group k-menu-group k-popup k-reset ${specialClass}" style="display: none; max-height: 971.014px; overflow: auto; position: absolute; font-size: 14px; font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-stretch: 100%; font-style: normal; font-weight: 500; line-height: normal;" role="menu" data-role="popup" aria-hidden="true">

            </ul>
        </div>
    </li>`;
        return generateElements(parent)[0];
    }

    const generateParentLinkNew = (title, url, specialClass, target = '_blank') => {
        const parent = `<div role="listbox" aria-expanded="false" class="ui item dropdown" tabindex="0" id="${specialClass}">
                        <a class="item" target="${target}" href="${url}" style="padding: 0 0 0 0;margin: 0 0 -4px;"><span><span>${title}</span></span></a>
                        <i aria-hidden="true" class="dropdown icon"></i>
                        <div class="menu transition ${specialClass}">
                        </div></div>`;
        return generateElements(parent)[0];
    }

    const generateChildLinkNew = (title, url, backgroundcolor, target) => {
        const child = `<a role="option" aria-checked="false" style="color:${backgroundcolor}!important" class="item" href="${url}" target="${target}"><span class="text">${title}</span></a>`;
        return generateElements(child)[0];
    }

    let apiData = [];
    let advertiserId = getAdvertiserId();

    const getApiData = async () => {
        advertiserId = getAdvertiserId();

        if (apiData && apiData.data && apiData.data.id === advertiserId) {
            addSCLink(apiData);
        } else {
            //console.log(`getting data again since advertiser id has changed`);
            resetNav(advertiserId);
            const subCampaignsRequest = await fetch(`https://campaigns.rtbhouse.biz/api/advertisers/${advertiserId}/campaigns`);
            apiData = await subCampaignsRequest.json();
            apiData.data = apiData.data.sort((a, b) => a.name.localeCompare(b.name));
            apiData.data.id = advertiserId;
            addSCLink(apiData);
        }
    };

    const addSCLink = (apiData) => {
        if (!apiData) return;

        //console.log(`building menu for ${apiData.data.id}`);

        const uniqueSelector = "subcampaigns";
        let parentFn = generateParentLinkNew;
        let childFn = generateChildLinkNew;
        let selector = ".app-secondary-menu > a:nth-child(3)";
        let bindOnClick = true;
        let navigationMenuSelector = '.app-secondary-menu';
        let navigationMenuSelectorPosition = 0;

        if (urlWithHash()) {
            parentFn = generateParentLink;
            childFn = generateChildLink;
            selector = "#submenu > ul > li:nth-child(3)";
            navigationMenuSelector = '.k-menu-horizontal';
            navigationMenuSelectorPosition = 2;
            bindOnClick = false;
        }

        const scParent = parentFn("Subcampaigns", `https://campaigns.rtbhouse.biz/advertisers/${advertiserId}/subcampaigns`, uniqueSelector, '');

        if (!(document.querySelector(selector) == null || document.querySelectorAll("#subcampaigns").length == 0)) {
            window.setTimeout(() => {
                addSCLink(apiData);
            }, 2000);
            return;
        }

        if (document.querySelector(selector) && document.querySelector(selector).innerText == 'Subcampaigns') {
            //console.log(`replacing the original menu with custom menu`);
            document.querySelector(selector).replaceWith(scParent);
            if (bindOnClick) {
                document.getElementById(uniqueSelector).addEventListener("click", function (e) {
                    toggleMenu(uniqueSelector);
                }, false);
            }

            let activeSC = apiData.data.filter(({ status }) => status == 'ACTIVE');
            let pausedSC = apiData.data.filter(({ status, archivedAt }) => status == 'PAUSED' && archivedAt == null);

            let green = "#21ba45";
            let orange = "#f2711c";

            activeSC.forEach(({ name, id }) => {
                const linkHtml = childFn(name, `https://campaigns.rtbhouse.biz/advertisers/${advertiserId}/subcampaigns/${id}/settings/bidding-parameters`, green, '');
                document.querySelectorAll(`.${uniqueSelector}`)[0].append(linkHtml);
            });
            pausedSC.forEach(({ name, id }) => {
                const linkHtml = childFn(name, `https://campaigns.rtbhouse.biz/advertisers/${advertiserId}/subcampaigns/${id}/settings/bidding-parameters`, orange, '');
                document.querySelectorAll(`.${uniqueSelector}`)[0].append(linkHtml);
            });

            addNewMenu(parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, "techtools", "Tech Tools", `https://techtools.rtbhouse.biz/tools/#/advertisers/${advertiserId}`, ttLinks, advertiserId);
            addNewMenu(parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, "reports", "Reports", `https://reports.rtbhouse.biz/#/advertisers/${advertiserId}`, reportLinks, advertiserId);
            addNewMenu(parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, "automation", "Automation", `https://automation.rtbhouse.biz/advertisers/${advertiserId}`, automationLinks, advertiserId);
	    addNewMenu(parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, "external", "External", `https://lookerstudio.google.com/u/0/reporting/`, externalLinks, advertiserId);
        }
        else {
            //console.log(`original menu not found, assuming custom menu already exists`);
        }
    }

    const addNewMenu = (parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, uniqueSelector, title, baseUrl, linksArray, advertiserId) => {
        if (document.querySelectorAll(`.${uniqueSelector}`).length != 0) {
            if (urlWithHash()) {
                document.querySelectorAll(`.${uniqueSelector}`)[0].parentNode.parentNode.remove();
            }
            else {
                document.querySelectorAll(`.${uniqueSelector}`)[0].parentNode.remove();
            }
        }



        const parent = parentFn(title, `${baseUrl}`, uniqueSelector);
        document.querySelectorAll(navigationMenuSelector)[navigationMenuSelectorPosition].append(parent);

        if (bindOnClick) {
            document.getElementById(uniqueSelector).addEventListener("click", function (e) {
                toggleMenu(uniqueSelector);
            }, false);
        }

        linksArray.forEach(link => {
            let linkHtml = childFn(link[0], `${baseUrl}${link[1]}`, '', '_blank');
            if (link[1].startsWith('https')) {
                let newLink = `${link[1]}`.replace('advertiserId', advertiserId);
                linkHtml = childFn(link[0], `${newLink}`, '', '_blank');
            }
            document.querySelectorAll(`.${uniqueSelector}`)[0].append(linkHtml);
        });
    }

    let oldUrl = document.location.href;
    await getApiData();

    function resetNav(advertiserId) {
        if (!urlWithHash()) {
            var html = `<a href="https://campaigns.rtbhouse.biz/advertisers/${advertiserId}/subcampaigns" class="item"><span><span>Subcampaigns</span></span></a>`;
            if (document.querySelector(`#subcampaigns`)) {
                document.querySelector(`#subcampaigns`).replaceWith(generateElements(html)[0]);
            }
        }

        if (window.onurlchange === null) {
            window.addEventListener('urlchange', async () => {
                //console.log(`url changed from ${oldUrl} to ${document.location.href}`);
                if (oldUrl != document.location.href) {
                    oldUrl = document.location.href;
                    let newAdvertiserId = getAdvertiserId();
                    //console.log(`old id ${advertiserId} and new id ${newAdvertiserId}`);
                    if (newAdvertiserId != advertiserId) {
                        await getApiData();
                    }
                }
            });
        }

        window.setInterval(async function () {
            if (document.querySelectorAll("#subcampaigns").length == 0) {
                await getApiData();
            }
        }, 2000);
    }
})();
