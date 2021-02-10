
//Valid are ADDTIME, ADDDIST, CROSSTIME
const ADDTIME=0;
const ADDDIST=1;
const CROSSTIME=2;
currentMode=ADDTIME;


function do_update() {
	// we need this for our calcs!
	var pi=Math.PI;

	//get the input data as Numbers
	var GS = Number(document.getElementById('GS').value); 
	var FL = Number(document.getElementById('FL').value);
	var DTR = Number(document.getElementById('DTR').value);
	var dT = Number(document.getElementById('dT').value);
	var MIAS = Number(document.getElementById('MIAS').value);

	var ov1;							// output variables
	var ov2;

	//output the data only if it is vaguely valid
	if (GS>100 && GS <999 && FL>050 && FL<650 && DTR>100 && dT>0){
		
		// placeholder
		var ttime=document.getElementById('dT').value; 					//text
		var dnm=dT;
		
		switch(currentMode){
			
			case "0":
				break;
				
			case "1":
				//Calculate Time to run 
				var TTR = timetorun(DTR,GS);
				GSN=(DTR-dnm)/TTR;
				var dT=dnm/(GSN);
				break;
			
			case "2":				
					if (ttime.length<4) {								//its only 3 characters 
						var thours = parseFloat(ttime.slice(0,1));
						var tmins = parseFloat(ttime.slice(1,3));
					} else {
						var thours = parseFloat(ttime.slice(0,2));
						var tmins = parseFloat(ttime.slice(2,4));
					}
									
					//get current time for comparison	
					var today=new Date();
					var h=today.getUTCHours();
					var m=today.getUTCMinutes();
				

				//generate ETA
				var TTR=timetorun(DTR,GS);
				m=m+TTR; 										//add TTR to UTC minutes
				
				while(m>=60) {									//if minutes >60, increment hours. Allow for long legs (>1 hr)		
					h=h+1;
					m=m-60;
				}			
				
				if (h>24){h=h-24;} 								//if hours >24 then next day. Unlikely to go over 2 days!
							
				if (thours<h){ 									// the target time is on the next day	
					thours=thours + 24;
				}
				
				//calculate difference in minutes -the delay required, or dT			
				var dT = ((thours*60)+tmins)-((h*60)+m);
				break;
			}	


		//calculate speed of Mach 1 at altitude
		var machalt = (29.06 * Math.sqrt(518.7 - 3.57 * (FL/10)))

		//calculate required mach at alt (0 winds)
		var NMout = ((GS * 60 * DTR) / (60 * DTR + GS * dT)) / machalt;

		//if we have a reported mach, work out the difference between reported and actual, and add to our required (for wind)
		if (MIAS>0){
			// = current mach - target mach  
			if(MIAS>10){MIAS=MIAS/100;} //in case decimal is omitted	
			NMout=MIAS-(GS/(machalt))+NMout;
		}
		
		ov1=newGSpeed(DTR,GS,dT);
		ov2=ExtraTrackM(DTR,GS,dT);

		//format and output	
		document.getElementById('Mout').innerHTML = "." + Math.round(NMout*100);
		document.getElementById('outVal1').innerHTML = ov1;
		document.getElementById('outVal2').innerHTML = ov2;
		
		
		//calculate the off track times
		var tenout= tracktime(dT,10);
		var twentyout= tracktime(dT,20);
		var thirtyout= tracktime(dT,30);
		var fortyfiveout= tracktime(dT,45);

		//output the off track times
		document.getElementById('tenout').innerHTML = tenout;
		document.getElementById('twentyout').innerHTML = twentyout;
		document.getElementById('thirtyout').innerHTML = thirtyout;
		document.getElementById('fortyfiveout').innerHTML = fortyfiveout;
		
		//calculate the direct fix times
		var fixtenout= dirfixtime(DTR,GS,dT,10);
		var fixtwentyout= dirfixtime(DTR,GS,dT,20);
		var fixthirtyout= dirfixtime(DTR,GS,dT,30);
		var fixfortyfiveout= dirfixtime(DTR,GS,dT,45);
		
		//output direct fix times
		document.getElementById('fixtenout').innerHTML = fixtenout;
		document.getElementById('fixtwentyout').innerHTML = fixtwentyout;
		document.getElementById('fixthirtyout').innerHTML = fixthirtyout;
		document.getElementById('fixfortyfiveout').innerHTML = fixfortyfiveout;
		
		
		
		if (dT>5){
			document.getElementById('hold').innerHTML = "HOLD";
		} else {
			document.getElementById('hold').innerHTML = "&nbsp;";
		}

	} else {
	// No calcs required - blank all fields	

		document.getElementById('Mout').innerHTML = "&nbsp;&nbsp;&nbsp;";
		document.getElementById('tenout').innerHTML = "-";
		document.getElementById('twentyout').innerHTML = "-";
		document.getElementById('thirtyout').innerHTML = "-";
		document.getElementById('fortyfiveout').innerHTML = "-";
		document.getElementById('GSnew').innerHTML = "";
		document.getElementById('dNm').innerHTML = "";
		document.getElementById('hold').innerHTML = "&nbsp;";
	}

}


function timetorun(DTR,GS){
	var TTR = 60*DTR/GS;
	return TTR;
}


function newGSpeed(DTR,GS,dT)
	{
	var GSpeed = GS * 60 * DTR /(60*DTR + GS*dT);
	return Math.round(GSpeed);
	}
	
function ExtraTrackM(DTR,GS,dT)
	{
	var TTR = 60*DTR/GS;
	var Tmile= Math.round(DTR*dT/TTR);
	return Tmile;
	}
	
function tracktime(dT,deg)
	{
	var pi=Math.PI;;
	var arad=(deg * pi/180);
	var timer=Math.round((dT/( 2*(1-Math.cos(arad))))*10)/10;
	if (timer < 0) {timer = "+";}
	return timer;
	}

function dirfixtime(DTR,GS,dT,deg)
	{
	var pi=Math.PI;
	var d=60*DTR/GS; //Time to run to Fix on current track
	h=d+dT; // desired TTR
	var arad=(deg * pi/180);
	var fixtimer=((d*d)-(h*h))/((2*d*Math.cos(arad)-2*h));
	fixtimer = Math.round(fixtimer*10)/10;
	if (fixtimer < 0) {fixtimer = "+";}
	return fixtimer;
	}

	// ADD ONLOAD that looks at current and sets UI

	function setUI(butpressed){
		currentMode=butpressed;
		document.getElementById("but_addDist").className=(currentMode==ADDDIST?"buttsmallin":"buttsmall");
		document.getElementById("but_addTime").className=(currentMode==ADDTIME?"buttsmallin":"buttsmall");
		document.getElementById("but_crossTime").className=(currentMode==CROSSTIME?"buttsmallin":"buttsmall");

		switch (currentMode) {
			case "0":
				document.getElementById("inputDesc").textContent="Delay Required";
				document.getElementById("outDesc1").textContent="new GS:";
				document.getElementById("outDesc2").textContent="N nm:";
				break;

			case "1":
				document.getElementById("inputDesc").textContent="Distance Required";
				document.getElementById("outDesc1").textContent="new GS:";
				document.getElementById("outDesc2").textContent="dt:";
				break;
			case "2":
				document.getElementById("inputDesc").textContent="Time to Cross";
				document.getElementById("outDesc1").textContent="new GS:";
				document.getElementById("outDesc2").textContent="d Nm:";
				break;
	
			default:
				document.getElementById("inputDesc").textContent=butpressed;

				break;
		}
		do_update();

	}


	function exitThis(){
		window.opener=top;
		window.close();
	}