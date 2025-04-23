// ==UserScript==
// @name         [mari] Blue Panel - Super Subcampaigns, Tech Tools, Reports Navigation Menu
// @namespace    https://campaigns.rtbhouse.biz/
// @version      3.04.mari
// @description  Adds Automation, Subcampaign, Tech Tools, External Links, Automation, and Reports Menus in the Blue Panel
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
let techtoolLinks = GM_getValue("techtoolLinks");
let reportLinks = GM_getValue("reportLinks");
let automationLinks = GM_getValue("automationLinks");
let externalLinks = GM_getValue("externalLinks");

const setUserPref = (varName, defaultVal, menuText, promtText) => {
    GM_registerMenuCommand(menuText, () => {
        const val = prompt(promtText, GM_getValue(varName, defaultVal));
        if (val === null) {
            return;
        }
        GM_setValue(varName, val);
        location.reload();
    });
};

if (!techtoolLinks) {
    techtoolLinks = `[
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
    ['dCPC - Editor', '/136/params/form'],
    ['dCPC - Audit Log','/136/history'],
    ['Pacer - Editor','/153/params/form'],
    ['Pacer - Audit Log','/153/history']
    ]`;
}

if (!externalLinks) {
    externalLinks = `[
['Hourly Stats Dashboard', 'bf621f67-b452-4a91-9979-136714ec5798'],
['CTR analysis - red and orange flags', 'f7a9c6b8-8426-42e7-8a03-f6186124775d']
]`;
}

const getAdvertiserProperties = async (advertiserId) => {
    const query = `query GetAdvertiser($advertiserId: Int!) {
        advertiser(advertiserId: $advertiserId) {
            advertiserId
            info {
                name
                hash
            }
            invoiceRateCards {
                invoiceRateCardId
                info {
                    name
                }
            }
            campaigns {
                id
                status
                name
                archivedAt
            }
        }
    }`;
    const body = {
        "query": query,
        "variables": {
            "advertiserId": parseInt(advertiserId)
        }
    };

    const request = await fetch("https://campaigns.rtbhouse.biz/api/graphql", {
        "headers": {
            "accept": "*/*",
            "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,pl;q=0.6,es;q=0.5",
            "content-type": "application/json"
        },
        "body": JSON.stringify(body),
        "credentials": "include",
        "method": "POST",
        "mode": "cors",
        "referrer": `https://campaigns.rtbhouse.biz/advertisers/${advertiserId}/settings/general/status`,
        "referrerPolicy": "strict-origin-when-cross-origin"
    });

    const response = await request.json();
    return response.data.advertiser;
};

setUserPref("links", techtoolLinks, "Set Tech Tools links", "Enter all links as a 2D-Array ([ ['Link Title','/relative-link/'] ])");
setUserPref("reportLinks", reportLinks, "Set Reports links", "Enter all links as a 2D-Array ([ ['Link Title','/relative-link/'] ])");
setUserPref("automationLinks", automationLinks, "Set Automation links", "Enter all links as a 2D-Array ([ ['Link Title','/relative-link/'] ])");
setUserPref('externalLinks', externalLinks, "Set External links", "Enter all links as an 2D-Array ([ ['Link Title','/relative-link/'] ])");

techtoolLinks = JSON.parse(techtoolLinks.replace(/'/g, '"'));
reportLinks = JSON.parse(reportLinks.replace(/'/g, '"'));
automationLinks = JSON.parse(automationLinks.replace(/'/g, '"'));
externalLinks = JSON.parse(externalLinks.replace(/'/g, '"'));

(async () => {
    const targets = ['ratecards', 'subcampaigns', 'creativepacks', 'techtools', 'reports', 'automation'];

    const urlWithHash = () => document.location.href.includes("#");

    const getAdvertiserId = () => {
        if (document.location.href.match(/(?<=advertisers\/).*/) != null)
            return document.location.href.match(/(?<=advertisers\/).*/)[0].split("/")[0];
        else return '';
    };

    const showMenu = id => {
        if (document.querySelector(`#${id}`)) {
            //document.querySelector(`#${id}`).classList.add('active');
            document.querySelector(`#${id}`).classList.add('shown');
            document.querySelector(`.${id}menu`).style.display = '';
            //document.querySelector(`#${id} a`).classList.add('active');
            //document.querySelector(`#${id}`).classList.add('visible');
            //document.querySelector(`#${id}`).setAttribute('aria-expanded', 'true');
            //document.querySelector(`#${id} div.menu`).classList.add('active');
            //document.querySelector(`#${id} div.menu`).classList.add('visible');
        }
    };
    const hideMenu = id => {
        if (document.querySelector(`#${id}`)) {
            removeActiveClass();
            document.querySelector(`.${id}menu`).style.display = 'none';
            document.querySelector(`.${id}menu`).classList.remove('active');
            document.querySelectorAll(`.${id}menu a`).forEach(function (a) {
                a.classList.remove('active');
            })
            document.querySelector(`#${id}`).classList.remove('shown');
            //document.querySelector(`#${id}`).classList.remove('visible');
            //document.querySelector(`#${id}`).setAttribute('aria-expanded', 'true');
            //document.querySelector(`#${id} div.menu`).classList.remove('active');
            //document.querySelector(`#${id} div.menu`).classList.remove('visible');
        }
    };
    const toggleMenu = id => {
        if (document.querySelector(`#${id}`) && document.querySelector(`#${id}`).classList.contains('shown')) {
            hideMenu(id);
        } else {
            showMenu(id);
        }
    };

    const navigatePro = (path, id) => {
        // Use the history API to navigate without reloading
        history.pushState({}, "", path);

        // Dispatch a popstate event to inform React Router of the change
        const popStateEvent = new PopStateEvent("popstate", { state: {} });
        dispatchEvent(popStateEvent);


        targets.forEach(target => {
            hideMenu(target);
        });
        showMenu(id);
    };

    const bindOnClickFn = uniqueSelector => {
        document.getElementById(uniqueSelector).addEventListener("click", function (e) {
            toggleMenu(uniqueSelector);
        }, false);

        const parentLink = document.querySelector(`.${uniqueSelector}-parent`);
        const parentHref = parentLink.getAttribute('href');

        if (!(parentHref.indexOf('#') > -1 || parentHref.indexOf('http') > -1)) {
            parentLink.addEventListener('click', function (event) {
                event.preventDefault();
                navigatePro(parentHref, uniqueSelector);
            });
        }

        const childLinks = document.querySelectorAll(`.${uniqueSelector} > a`);
        childLinks.forEach(childLink => {
            const childHref = childLink.getAttribute('href');

            if (childHref.indexOf('#') > -1 || childHref.indexOf('http') > -1) {
                return;
            }
            childLink.addEventListener('click', function (event) {
                event.preventDefault();
                navigatePro(childHref, uniqueSelector);
            });
        });
    };

    if (!urlWithHash()) {
        window.addEventListener('mouseup', e => {
            const targets = ['ratecards', 'subcampaigns', 'creativepacks', 'techtools', 'reports', 'automation'];
            targets.forEach(target => {
                if (!e.target.classList.value.includes(target) || !e.target.getAttribute('id') == target) {
                    hideMenu(target);
                }
            });
        });
    }

    const generateElements = html => {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.children;
    };

    const generateChildLink = (title, url, backgroundcolor, target = '_blank') => {
        const child = `<li class="k-item k-state-default" role="menuitem"><a class="k-link" target="${target}" style="color:${backgroundcolor}!important" href="${url}">${title}</a></li>`;
        return generateElements(child)[0];
    };

    const generateParentLink = (title, url, specialClass, target = '_blank') => {
        const parent = `<li id="${specialClass}" class="k-item k-state-default" role="menuitem" aria-haspopup="true" style="z-index: auto;">
	<span class="k-link"><a target="${target}" class="k-link" style="color:#395c75" href="${url}">${title}</a><span class="k-icon  k-i-arrow-60-down"></span></span>
        <div class="k-animation-container" style="width: 204px; height: 358px; overflow: hidden; display: none; position: absolute; z-index: 10002; top: 36.0048px; left: 0px; box-sizing: content-box;">
            <ul class="k-group k-menu-group k-popup k-reset ${specialClass}" style="display: none; max-height: 971.014px; overflow: auto; position: absolute; font-size: 14px; font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-stretch: 100%; font-style: normal; font-weight: 500; line-height: normal;" role="menu" data-role="popup" aria-hidden="true">

            </ul>
        </div>
    </li>`;
        return generateElements(parent)[0];
    };

    const generateParentLinkNew = (title, url, specialClass, target = '_blank') => {
        const className = document.querySelector('.menu-horizontal:nth-child(2) > a:nth-child(1)')?.classList?.value || '';
        const parent = `<div class="${className}" id="${specialClass}" tabindex="0">
            <span><a class="${specialClass}-parent ${className}" target="${target}" href="${url}" style="padding: 0 0 0 0;">${title} </a><i aria-hidden="true" class="dropdown icon"></i></span>
            <menu class="${specialClass} ${specialClass}menu sc-etPtWW gNZOCCa menu sc-txhaY ebQouNa menu-vertical sc-ePpfBx cseqkra menu-expandable-list" style="display: none!important"></menu>
        </div>`;

        return generateElements(parent)[0];
    };

    const generateChildLinkNew = (title, url, backgroundcolor, target) => {
        const className = document.querySelector('.menu-horizontal:nth-child(2) > a:nth-child(1)')?.classList?.value || '';
        const child = `<a class="${className}" style="color:${backgroundcolor}!important" href="${url}" target="${target}">${title}</a>`;
        return generateElements(child)[0];
    };

    let apiData = [];
    let advertiserId = getAdvertiserId();

    const getApiData = async () => {
        advertiserId = getAdvertiserId();

        if (apiData && apiData.advertiserId === advertiserId) {
            addSCLink(apiData);
        } else if (advertiserId && advertiserId.length > 0) {
            //console.log(`getting data again since advertiser id has changed`);
            resetNav(advertiserId);

            const apiData = await getAdvertiserProperties(advertiserId);
            apiData.data = apiData.subcampaigns
                .flatMap(({ subcampaignId, info }) => ({ id: subcampaignId, ...info }))
                .filter(({ archivedAt }) => archivedAt == null)
                .sort((a, b) => a.name.localeCompare(b.name));

            addSCLink(apiData);
        }
    };

    const addSCLink = (apiData) => {
        if (!apiData) return;

        const rcUniqueSelector = "ratecards";
        const scUniqueSelector = "subcampaigns";
        const cpUniqueSelector = "creativepacks";

        let parentFn = generateParentLinkNew;
        let childFn = generateChildLinkNew;

        let bindOnClick = true;
        let navigationMenuSelector = '.menu-horizontal:nth-child(2)';
        let navigationMenuSelectorPosition = 0;

        let rcSelector = `${navigationMenuSelector} > a:nth-child(2)`;
        let scSelector = `${navigationMenuSelector} > a:nth-child(3)`;
        let cpSelector = `${navigationMenuSelector} > a:nth-child(5)`;

        if (urlWithHash()) {
            parentFn = generateParentLink;
            childFn = generateChildLink;
            rcSelector = "#submenu > ul > li:nth-child(2)";
            scSelector = "#submenu > ul > li:nth-child(3)";
            cpSelector = "#submenu > ul > li:nth-child(5)";

            bindOnClick = false;
            navigationMenuSelector = '.k-menu-horizontal';
            navigationMenuSelectorPosition = 2;
        }

        const scParent = parentFn("Subcampaigns", `/advertisers/${advertiserId}/subcampaigns`, scUniqueSelector, '');
        const cpParent = parentFn("Creative packs", `/advertisers/${advertiserId}/creative-packs`, cpUniqueSelector, '');
        const rcParent = parentFn("Rate cards", `/advertisers/${advertiserId}/rate-cards`, rcUniqueSelector, '');

        if (!(document.querySelector(scSelector) == null || document.querySelectorAll("#subcampaigns").length == 0)) {
            window.setTimeout(() => {
                addSCLink(apiData);
            }, 2000);
            return;
        }

        if (document.querySelector(scSelector) && document.querySelector(scSelector).innerText == 'Subcampaigns') {

            document.querySelector(scSelector).replaceWith(scParent);
            document.querySelector(cpSelector).replaceWith(cpParent);
            document.querySelector(rcSelector).replaceWith(rcParent);

            const activeSC = apiData.data.filter(({ status }) => status == 'ACTIVE');
            const pausedSC = apiData.data.filter(({ status }) => status == 'PAUSED');
            const newSC = apiData.data.filter(({ status }) => status == 'NEW');
            const activeRateCards = apiData.invoiceRateCards.filter(rateCard =>
                rateCard.subcampaigns.length > 0 &&
                rateCard.subcampaigns.some(subcampaign => subcampaign.info.status === 'ACTIVE')
            );
            const inactiveRateCards = apiData.invoiceRateCards.filter(rateCard =>
                rateCard.subcampaigns.length === 0 ||
                !rateCard.subcampaigns.some(subcampaign => subcampaign.info.status === 'ACTIVE')
            );

            const green = "#21ba45";
            const orange = "#f2711c";

            activeSC.forEach(({ name, id }) => {
                const linkHtml = childFn(name, `/advertisers/${advertiserId}/subcampaigns/${id}/settings/general/status`, green, '', scUniqueSelector, id);
                document.querySelectorAll(`.${scUniqueSelector}`)[0].append(linkHtml);

                const cpLinkHtml = childFn(name, `/advertisers/${advertiserId}/subcampaigns/${id}/creative-packs`, green, '', cpUniqueSelector, id);
                document.querySelectorAll(`.${cpUniqueSelector}`)[0].append(cpLinkHtml);
            });
            pausedSC.forEach(({ name, id }) => {
                const linkHtml = childFn(name, `/advertisers/${advertiserId}/subcampaigns/${id}/settings/general/status`, orange, '', scUniqueSelector, id);
                document.querySelectorAll(`.${scUniqueSelector}`)[0].append(linkHtml);

                const cpLinkHtml = childFn(name, `/advertisers/${advertiserId}/subcampaigns/${id}/creative-packs`, orange, '', cpUniqueSelector, id);
                document.querySelectorAll(`.${cpUniqueSelector}`)[0].append(cpLinkHtml);
            });
            newSC.forEach(({ name, id }) => {
                const cpLinkHtml = childFn(name, `/advertisers/${advertiserId}/subcampaigns/${id}/creative-packs`, '', '', cpUniqueSelector, id);
                document.querySelectorAll(`.${cpUniqueSelector}`)[0].append(cpLinkHtml);
            });
            activeRateCards.forEach(({ info, invoiceRateCardId }) => {
                const linkHtml = childFn(info.name, `/advertisers/${advertiserId}/rate-cards/${invoiceRateCardId}/general`, green, '', rcUniqueSelector, invoiceRateCardId);
                document.querySelectorAll(`.${rcUniqueSelector}`)[0].append(linkHtml);
            });
            inactiveRateCards.forEach(({ info, invoiceRateCardId }) => {
                const linkHtml = childFn(info.name, `/advertisers/${advertiserId}/rate-cards/${invoiceRateCardId}/general`, orange, '', rcUniqueSelector, invoiceRateCardId);
                document.querySelectorAll(`.${rcUniqueSelector}`)[0].append(linkHtml);
            });

            if (bindOnClick) {
                bindOnClickFn(scUniqueSelector);
                bindOnClickFn(cpUniqueSelector);
                bindOnClickFn(rcUniqueSelector);
            }

            const style = document.createElement('style');
            style.innerHTML = `
            .gNZOCCa {
                display: flex;
                margin: 0px;
                font-weight: 400;
                z-index: var(--menu-z-index);
                gap: var(--menu-gap);
                padding: var(--menu-padding, 0);
                background: var(--menu-background-color);
            }
            .cseqkra {
                position: absolute;
                margin-top: 10px;
                margin-left: -16px;
                box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 10px;
                border-radius: var(--menu-expandable-list-border-radius, var(--border-radius));
                border: solid 1px var(--menu-expandable-list-border-color, var(--border-color));
                
                flex-direction: column;
                flex: 1 1 0%;
            }
            .ebQouNa .menu-item {
                text-align: left;
            }
            .bIQeWa > .menu-item.active a {
                --menu-item-active-color: var(--color-primary500);
                border-color: var(--menu-item-active-border-color, var(--color-primary500));
            }
            `;

            document.head.appendChild(style);

            addNewMenu(parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, "techtools", "Tech Tools", `https://techtools.rtbhouse.biz/tools/#/advertisers/${advertiserId}`, techtoolLinks, apiData);
            addNewMenu(parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, "reports", "Reports", `https://reports.rtbhouse.biz/#/advertisers/${advertiserId}`, reportLinks, apiData);
            addNewMenu(parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, "automation", "Automation", `https://automation.rtbhouse.biz/advertisers/${advertiserId}/jobs`, automationLinks, apiData);
	    addNewMenu(parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, "external", "External", `https://lookerstudio.google.com/u/0/reporting/`, externalLinks, apiData);
        }

    };

    const removeActiveClass = () => {
        const path = window.location.href;

        targets.forEach(target => {
            const element = document.querySelector(`#${target}`);
            const link = document.querySelector(`#${target} a`);
            target = target.replace('creativepacks', 'creative-packs').replace('ratecards', 'rate-cards');
            if (path.includes(target)) {
                element?.classList.add('active');
                link?.classList.add('active');
            } else {
                element?.classList.remove('active');
            }
            link?.classList.remove('active');
        });
    }

    const addNewMenu = (parentFn, childFn, navigationMenuSelector, navigationMenuSelectorPosition, bindOnClick, uniqueSelector, title, baseUrl, linksArray, apiData) => {
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

        const advertiserName = apiData.info.name;
        const today = new Date(Date.now()).toISOString().split('T')[0];
        const oneWeekAgo = new Date(Date.now() - (86400000 * 7)).toISOString().split('T')[0];
        const oneMonthAgo = new Date(Date.now() - (86400000 * 30)).toISOString().split('T')[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA');

        if (bindOnClick) {
            bindOnClickFn(uniqueSelector);
        }

        const replacements = {
            'advertiserId': advertiserId,
            'advertiserName': advertiserName,
            'oneWeekAgo': oneWeekAgo,
            'today': today,
            'oneMonthAgo': oneMonthAgo,
            'startOfMonth': startOfMonth
        };

        linksArray.forEach(link => {
            let href = link[1];
            for (const [key, value] of Object.entries(replacements)) {
                href = href.replaceAll(key, value);
            }

            const linkHtml = href.startsWith('https') ? childFn(link[0], `${href}`, '', '_blank') : childFn(link[0], `${baseUrl}${href}`, '', '_blank');
            document.querySelectorAll(`.${uniqueSelector}`)[0].append(linkHtml);
        });
    };

    let oldUrl = document.location.href;
    await getApiData();

    function resetNav(advertiserId) {
        if (!urlWithHash()) {
            var html = `<a href="/#/advertisers/${advertiserId}/subcampaigns" class="item"><span><span>Subcampaigns</span></span></a>`;
            if (document.querySelector(`#subcampaigns`))
                document.querySelector(`#subcampaigns`).replaceWith(generateElements(html)[0]);

            var cphtml = `<a href="/#/advertisers/${advertiserId}/creative-packs" class="item"><span><span>Creative packs</span></span></a>`;
            if (document.querySelector(`#creativepacks`))
                document.querySelector(`#creativepacks`).replaceWith(generateElements(cphtml)[0]);

            var rchtml = `<a href="/#/advertisers/${advertiserId}/rate-cards" class="item"><span><span>Rate cards</span></span></a>`;
            if (document.querySelector(`#ratecards`))
                document.querySelector(`#ratecards`).replaceWith(generateElements(rchtml)[0]);

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
        removeActiveClass();
    }, 1000);

})();
