var tabs = require("sdk/tabs"),
pageMod = require('sdk/page-mod'),
{ ActionButton } = require('sdk/ui/button/action'),
button = ActionButton({
	id: 'luxtown-fun-glass-icon',
	label: 'Luxtown Fun Glass',
	icon: {
		'16': './icon16.png',
		'32': './icon32.png',
		'64': './icon64.png'
	},
	disabled: true
});
tabs.on('ready', function(tab) {
	button.state(tab, {disabled: true});
	pageMod.PageMod({
		include: [
			/https:\/\/sentinel2\.luxoft\.com.*\/LUXTOWN.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/AGLP.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/BHR.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/BLG.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/BTD.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/DNEPR.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/FD.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/FORUMS.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/GRM.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/HRDEP.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/HRGUIDE.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/IT.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/KIV.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/LD.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/LP.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/LUXPL.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/MEX.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/MKTDEPT.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/MSK.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/ODS.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/OMK.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/QC_LUXTOWN.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/SNG.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/SPB.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/SWZ.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/UK.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/USA.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/VIE.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/PAD.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/LC.*/,
            /https:\/\/sentinel2\.luxoft\.com.*\/~.*/
		],
		exclude: [
			/https:\/\/sentinel2\.luxoft\.com.*\/Luxtown\+Fun\+Glass\+-\+Drive\+The\+Change.*/
		],
		contentScriptFile: './content.js',
		contentScriptWhen: 'end',
		onAttach: function() {
			button.state(tab, {disabled: false});
		}
	});
});

