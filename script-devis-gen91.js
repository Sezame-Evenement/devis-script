function isEventAfter22h00(eventTimeString) {
    const parts = eventTimeString.split(' au ');
    const endTimeString = parts.length > 1 ? parts[1] : '';
    const timePart = endTimeString.split('à')[1].trim(); 
    const [hours, minutes] = timePart.split('h').map(Number);

    console.log(`isEventAfter22h00: Event ends at ${hours}h${minutes}`);

    return hours >= 22 || (hours < 6 && hours >= 0);
}


function parseEventTimes(eventTimeString) {
    // Mapping French month names to month numbers (0-indexed)
    const monthNames = {
        'janv': 0, 'févr': 1, 'mars': 2, 'avr': 3, 'mai': 4, 'juin': 5,
        'juil': 6, 'août': 7, 'sept': 8, 'oct': 9, 'nov': 10, 'déc': 11,
    };

    // Remove periods and split the string to extract dates and times
    const cleanedString = eventTimeString.replace(/\./g, '');
    const parts = cleanedString.split(' à ');
    
    // Assuming the format "Day Month Year Time au Day Month Year Time"
    const [startDay, startMonthYear, startTime, , endDay, endMonthYear, endTime] = parts.join(' ').split(' ');
    
    // Function to parse date parts into a Date object
    const parseDate = (day, monthYear, time) => {
        const [month, year] = monthYear.split(' ');
        const [hours, minutes] = time.split('h');
        const date = new Date(Date.UTC(year, monthNames[month], day, hours, minutes));
        return date;
    };

    const startDateTime = parseDate(startDay, startMonthYear, startTime);
    const endDateTime = parseDate(endDay, endMonthYear, endTime);

    console.log(`Parsed Start DateTime: ${startDateTime.toISOString()}`);
    console.log(`Parsed End DateTime: ${endDateTime.toISOString()}`);

    return { startDateTime, endDateTime };
}





function calculateStaffCosts() {
    // Extract event times directly from the element
    const eventTimeString = $('#data-text-item-check').text();
    console.log(`Raw Event Time String: '${eventTimeString}'`);
    const parts = eventTimeString.split(' au ');
    const startDateTimeString = parts[0];
    const endDateTimeString = parts.length > 1 ? parts[1] : startDateTimeString; // Fallback to startDateTime if endDateTime is not available

    // Convert to Date objects
    const startDateTime = new Date(startDateTimeString.split(' ')[0].split('/').reverse().join('-') + 'T' + startDateTimeString.split(' ')[1] + ':00');
    const endDateTime = new Date(endDateTimeString.split(' ')[0].split('/').reverse().join('-') + 'T' + endDateTimeString.split('à')[1].trim() + ':00');

    // Other calculations remain the same...
    const numberOfAttendees = parseInt($('#nb-personnes-final-2').val(), 10); // Get the number of attendees from the input

    // Check if the event requires security
    const eventRequiresSecurity = isEventAfter22h00(eventTimeString);
    console.log("Event requires security:", eventRequiresSecurity);

    // Calculate working hours for each staff type based on radio selection
    // Adjust these based on whether radio 4 or 5 is selected
    let cateringArrivalOffset = $('.ms-radio-button-tab-is-4:checked, .ms-radio-button-tab-is-5:checked').length > 0 ? 0 : -2;
    let cateringDepartureOffset = $('.ms-radio-button-tab-is-4:checked, .ms-radio-button-tab-is-5:checked').length > 0 ? 0 : 1;
    let regisseurArrivalOffset = $('.ms-radio-button-tab-is-4:checked, .ms-radio-button-tab-is-5:checked').length > 0 ? -1 : -2;
    let regisseurDepartureOffset = 1; // Regisseur departure offset remains the same for all scenarios

    const securityArrivalOffset = -0.5; // Security arrives 30 min before
    const securityDepartureOffset = 0.5; // and leaves 30 min after

    // Calculate actual working hours
    const eventDurationHours = (endDateTime - startDateTime) / 3600000; // Convert milliseconds to hours
    const cateringHours = Math.max(0, eventDurationHours + cateringArrivalOffset + cateringDepartureOffset);
    const securityHours = eventRequiresSecurity ? Math.max(0, eventDurationHours + securityArrivalOffset + securityDepartureOffset) : 0;
    const regisseurHours = Math.max(0, eventDurationHours + regisseurArrivalOffset + regisseurDepartureOffset);
    console.log("Catering Hours:", cateringHours, "Security Hours:", securityHours, "Regisseur Hours:", regisseurHours);

    // Assuming costPerCateringStaff, costPerSecurityStaff, and costPerRegisseur are defined
    const cateringTeamMembers = $('.ms-radio-button-tab-is-4:checked, .ms-radio-button-tab-is-5:checked').length > 0 ? 0 : getNumberOfCateringTeamMembers(numberOfAttendees);
    const securityTeamMembers = eventRequiresSecurity ? getNumberOfSecurityMembers(numberOfAttendees, $('#nombre-securite').text()) : 0; // Update this call as necessary
    const regisseurTeamMembers = 1; // Always 1 Regisseur

    console.log("Catering Team Members:", cateringTeamMembers, "Security Team Members:", securityTeamMembers, "Regisseur Team Members:", regisseurTeamMembers);


    // Calculate total costs
    const totalCateringCost = cateringHours * costPerCateringStaff * cateringTeamMembers;
    const totalSecurityCost = securityHours * costPerSecurityStaff * securityTeamMembers;
    const totalRegisseurCost = regisseurHours * costPerRegisseur * regisseurTeamMembers;

    return {
        totalCateringCost,
        totalSecurityCost,
        totalRegisseurCost
    };
}






$(document).ready(function() {
    const initialAttendees = $('#nb-personnes-final-2').attr('data');
    $('#nb-personnes-final-2').val(initialAttendees);
    console.log("Document ready");

    initialPriceTraiteurPerso = 120;
    $('.price-traiteur-perso').text(initialPriceTraiteurPerso); // Set the initial UI element to 120

    console.log(`Initial Price Traiteur Perso: ${initialPriceTraiteurPerso}`);

    $('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
        console.log(`Radio button clicked: ${$(this).attr('class')}`);
        let isRadio4Or5 = $(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5');
        if (isRadio4Or5) {
            $('#nombre-equipier-traiteur').text('0');
        } else {
            updateTeamMembers(); 
        }
        resetPricingCalculator();
    });

    $('#nb-personnes-final-2').on('input', function() {
        console.log("Number of attendees changed");
        updateTeamMembers();
        updatePricesAndTotal();
    });

    const eventTimeString = $('#data-text-item-check').text();
    console.log(`Event Time String: ${eventTimeString}`);
    updateSecurityStaffBasedOnEventTime(eventTimeString);
    updateTeamMembers();
    updatePricesAndTotal();
});

function updateSecurityStaffBasedOnEventTime(eventTimeString) {
    console.log(`updateSecurityStaffBasedOnEventTime: ${eventTimeString}`);
    if (isEventAfter22h00(eventTimeString)) {
        console.log("Event is after 22h00, showing security wrapper");
        $('.wrapper-security').show();
    } else {
        console.log("Event is not after 22h00, hiding security wrapper");
        $('.wrapper-security').hide();
        $('#nombre-securite').text('0');
    }
}


let initialPriceSalle = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
console.log(`Initial Price Salle converted to number: ${initialPriceSalle}`); // Log the conversion for clarity

let initialPriceTraiteurPerso = 0;
let YOUR_DEFAULT_CATERING_STAFF_COST = 35; 
let costPerCateringStaff = YOUR_DEFAULT_CATERING_STAFF_COST;

function getNumberOfCateringTeamMembers(numberOfAttendees) {
    const cateringBrackets = [
        { min: 0, max: 49, team: 2 },
        { min: 50, max: 99, team: 3 },
        { min: 100, max: 149, team: 4 },
        { min: 150, max: 199, team: 5 },
        { min: 200, max: 249, team: 6 },
        { min: 250, max: 299, team: 7 },
        { min: 300, max: 349, team: 8 },
        { min: 350, max: 399, team: 9 },
        { min: 400, max: 449, team: 10 },
        { min: 450, max: 499, team: 11 },
        { min: 500, max: 549, team: 12 },
        { min: 550, max: 599, team: 13 },
        { min: 600, max: 649, team: 14 },
        { min: 650, max: 699, team: 15 },
        { min: 700, max: 749, team: 16 },
        { min: 750, max: 799, team: 17 },
        { min: 800, max: 849, team: 18 },
        { min: 850, max: 899, team: 19 },
        { min: 900, max: 949, team: 20 },
        { min: 950, max: 999, team: 21 }
    ];
    let cateringTeamSize = cateringBrackets.find(bracket => numberOfAttendees >= bracket.min && numberOfAttendees <= bracket.max);
    return cateringTeamSize ? cateringTeamSize.team : "Error";
}

function getNumberOfSecurityMembers(numberOfAttendees, numberOfSecurityAttendees) {
    const securityBrackets = [
        { min: 0, max: 99, team: 1 },
        { min: 100, max: 149, team: 2 },
        { min: 150, max: 199, team: 3 },
        { min: 200, max: 399, team: 4 },
        { min: 400, max: 599, team: 5 },
        { min: 600, max: 799, team: 6 },
        { min: 800, max: 999, team: 7 },
    ];
    let securityTeamSize = securityBrackets.find(bracket => numberOfAttendees >= bracket.min && numberOfAttendees <= bracket.max);
    return securityTeamSize ? securityTeamSize.team : "Error";
}

function updateTeamMembers() {
    console.log("updateTeamMembers called");

    let isRadio4Or5Checked = $('.ms-radio-button-tab-is-4:checked, .ms-radio-button-tab-is-5:checked').length > 0;
    console.log(`Is Radio 4 or 5 Checked: ${isRadio4Or5Checked}`);


    if (isRadio4Or5Checked) {
        $('#nombre-equipier-traiteur').text('0');
        return;
    }

    const rawCateringValue = $('#nb-personnes-final-2').val();
    const numberOfAttendees = parseInt(rawCateringValue, 10);
    console.log(`Number of Attendees: ${numberOfAttendees}`);

    if (!isNaN(numberOfAttendees)) {
        const cateringTeamMembers = getNumberOfCateringTeamMembers(numberOfAttendees);
        console.log(`Catering Team Members: ${cateringTeamMembers}`);

        if ($('.wrapper-equipier-traiteur').is(':visible')) {
            $('#nombre-equipier-traiteur').text(cateringTeamMembers);
        } else {
            console.log('Invalid input for number of attendees');

            $('#nombre-equipier-traiteur').text('0');
        }
    } else {
        console.log('Invalid input for number of attendees');
        $('#nombre-equipier-traiteur').text('0');
    }

    const eventTimeString = $('#data-text-item-check').text();
    updateSecurityStaff(eventTimeString, numberOfAttendees);
}

function updateSecurityStaff(eventTimeString, numberOfAttendees) {
    const { startDateTime, endDateTime } = parseEventTimes(eventTimeString);
    let totalHours = 0;

    if ($('.wrapper-security').is(':visible')) {
        if (isEventAfter22h00(eventTimeString)) {
            const securityStartTime = new Date(startDateTime.getTime() - 30 * 60000); // 30 minutes before
            const securityEndTime = new Date(endDateTime.getTime() + 30 * 60000); // 30 minutes after
            totalHours = (securityEndTime - securityStartTime) / (1000 * 60 * 60); // Convert milliseconds to hours
            
            const securityTeamMembers = getNumberOfSecurityMembers(numberOfAttendees);
            const costPerSecurityStaff = 35; // Assuming a fixed cost per hour for simplicity
            const totalCost = securityTeamMembers * costPerSecurityStaff * totalHours;

            $('#nombre-securite').text(securityTeamMembers);
            // Assuming you have an element to show total cost for security staff
            $('#total-cost-security').text(totalCost.toFixed(2));
        } else {
            $('#nombre-securite').text(0);
            // Reset total cost if conditions not met
            $('#total-cost-security').text('0.00');
        }
    } else {
        $('#nombre-securite').text(0);
        $('#total-cost-security').text('0.00');
    }
}




$('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
    console.log(`Radio button clicked: ${$(this).attr('class')}`);

    let isRadio4Or5 = $(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5');
    if (isRadio4Or5) {
        $('#nombre-equipier-traiteur').text('0');
    } else {
        updateTeamMembers(); 
    }
    resetPricingCalculator();
});


const updatePricesAndTotal = () => {
    console.log("updatePricesAndTotal called");

    let isRadio4Or5Checked = $('.ms-radio-button-tab-is-4:checked, .ms-radio-button-tab-is-5:checked').length > 0;
    if(isRadio4Or5Checked) {
        $('#nombre-equipier-traiteur').text('0'); 
             console.log("Updating prices: Catering and Security staff set to 0 due to radio 4 or 5 selection"); 
    }
    let numberOfCateringStaff = Number($('#nombre-equipier-traiteur').text());
    let sumSpecialite1 = 0;
    let sumSpecialite2 = 0;
    let sumSpecialite3 = 0;
    let sumPetitdejeuner1 = 0;
    let sumPetitdejeuner2 = 0;
    let sumDejeuner1 = 0;
    let sumDejeuner2 = 0;
    let sumDejeuner3 = 0;
    let sumDejeuner4 = 0;
    let sumPause = 0;
    let sumDiner1 = 0;
    let sumDiner2 = 0;
    let sumDiner3 = 0;

    const numberOfPersonsSpecialite1 = Number($('.specialite-number-1').val());
    const numberOfPersonsSpecialite2 = Number($('.specialite-number-2').val());
    const numberOfPersonsSpecialite3 = Number($('.specialite-number-3').val());
    const numberOfPersonsPetitdejeuner1 = Number($('.petit-dejeuner-number-1').val());
    const numberOfPersonsPetitdejeuner2 = Number($('.petit-dejeuner-number-2').val());
    const numberOfPersonsDejeuner1 = Number($('.dejeuner-number-1').val());
    const numberOfPersonsDejeuner2 = Number($('.dejeuner-number-2').val());
    const numberOfPersonsDejeuner3 = Number($('.dejeuner-number-3').val());
    const numberOfPersonsDejeuner4 = Number($('.dejeuner-number-4').val());
    const numberOfPersonsPause = Number($('.pause-aprem-number-1').val());
    const numberOfPersonsDiner1 = Number($('.diner-number-1').val());
    const numberOfPersonsDiner2 = Number($('.diner-number-2').val());
    const numberOfPersonsDiner3 = Number($('.diner-number-3').val());

    sumSpecialite1 = calculateCategorySum('checkbox-devis-specialite-1', numberOfPersonsSpecialite1);
    sumSpecialite2 = calculateCategorySum('checkbox-devis-specialite-2', numberOfPersonsSpecialite2);
    sumSpecialite3 = calculateCategorySum('checkbox-devis-specialite-3', numberOfPersonsSpecialite3);
    sumPetitdejeuner1 = calculateCategorySum('checkbox-devis-petitdejeuner-1', numberOfPersonsPetitdejeuner1);
    sumPetitdejeuner2 = calculateCategorySum('checkbox-devis-petitdejeuner-2', numberOfPersonsPetitdejeuner2);
    sumDejeuner1 = calculateCategorySum('checkbox-devis-dejeuner-1', numberOfPersonsDejeuner1);
    sumDejeuner2 = calculateCategorySum('checkbox-devis-dejeuner-2', numberOfPersonsDejeuner2);
    sumDejeuner3 = calculateCategorySum('checkbox-devis-dejeuner-3', numberOfPersonsDejeuner3);
    sumDejeuner4 = calculateCategorySum('checkbox-devis-dejeuner-4', numberOfPersonsDejeuner4);
    sumPause = calculateCategorySum('checkbox-devis-pause', numberOfPersonsPause);
    sumDiner1 = calculateCategorySum('checkbox-devis-diner-1', numberOfPersonsDiner1);
    sumDiner2 = calculateCategorySum('checkbox-devis-diner-2', numberOfPersonsDiner2);
    sumDiner3 = calculateCategorySum('checkbox-devis-diner-3', numberOfPersonsDiner3);

    let isRadio4Checked = $('.ms-radio-button-tab-is-4:checked').length > 0;
    let isRadio5Checked = $('.ms-radio-button-tab-is-5:checked').length > 0;

    let totalCostCateringStaff = 0;

    if (!isRadio4Checked && !isRadio5Checked) {
        totalCostCateringStaff = numberOfCateringStaff * costPerCateringStaff;
    }

    const numberOfRegisseurs = Number($('#nombre-regisseur').text());
    const numberOfSecurityStaff = Number($('#nombre-securite').text());

    const costPerRegisseur = 40;
    const costPerSecurityStaff = 35;

    const totalCostRegisseur = numberOfRegisseurs * costPerRegisseur;
    const totalCostSecurityStaff = numberOfSecurityStaff * costPerSecurityStaff;

    const totalStaffCostWithoutTVA = totalCostRegisseur + totalCostCateringStaff + totalCostSecurityStaff;

    $('#total-staff').text(totalStaffCostWithoutTVA.toFixed(2).replace('.', ','));

    const tvaRate = 0.2;
    const tvaRegisseur = totalCostRegisseur * tvaRate;
    const tvaCateringStaff = totalCostCateringStaff * tvaRate;
    const tvaSecurityStaff = totalCostSecurityStaff * tvaRate;

    const specialTVAValue = (sumSpecialite1 + sumSpecialite2 + sumSpecialite3 + sumPetitdejeuner1 + sumPetitdejeuner2 + sumDejeuner1 + sumDejeuner2 + sumDejeuner3 + sumDejeuner4 + sumPause + sumDiner1 + sumDiner2 + sumDiner3) * 0.1;

    updateSumDisplay('price-specialite', sumSpecialite1 + sumSpecialite2 + sumSpecialite3);
    updateSumDisplay('price-petitdejeuner', sumPetitdejeuner1 + sumPetitdejeuner2);
    updateSumDisplay('price-dejeuner', sumDejeuner1 + sumDejeuner2 + sumDejeuner3 + sumDejeuner4);
    updateSumDisplay('price-pause', sumPause);
    updateSumDisplay('price-diner', sumDiner1 + sumDiner2 + sumDiner3);

    const priceSalleValue = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
    const priceTraiteurPersoValue = Number($('.price-traiteur-perso').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));

    const totalSum = sumSpecialite1 + sumSpecialite2 + sumSpecialite3 + sumPetitdejeuner1 + sumPetitdejeuner2 + sumDejeuner1 + sumDejeuner2 + sumDejeuner3 + sumDejeuner4 + sumPause + sumDiner1 + sumDiner2 + sumDiner3 + priceSalleValue + priceTraiteurPersoValue + totalStaffCostWithoutTVA;

    const generalTVA = (priceSalleValue + priceTraiteurPersoValue) * 0.2;
    const totalTVA = generalTVA + specialTVAValue + tvaRegisseur + tvaCateringStaff + tvaSecurityStaff;

    const totalHT = totalSum;
    const totalTTC = totalSum + totalTVA;
    console.log(`Total HT: ${totalHT}, Total TTC: ${totalTTC}, Total TVA: ${totalTVA}`); 


    const formattedTotalHT = totalHT.toFixed(2).replace('.', ',');
    const formattedTotalTTC = totalTTC.toFixed(2).replace('.', ',');
    const formattedTVA = totalTVA.toFixed(2).replace('.', ',');

    $('.total-ht').text(formattedTotalHT);
    $('.total-ttc').text(formattedTotalTTC);
    $('.price-tva').text(formattedTVA);

    $('.hack42-send-value').val(formattedTotalHT);
};

function calculateCategorySum(className, numberOfPersons) {
    let sum = 0;
    $(`.${className}`).each(function() {
        const $checkbox = $(this);
        if ($checkbox.prop('checked')) {
            const addValue = Number($checkbox.attr('add-value').replace(',', '.'));
            console.log(`Adding value for ${className}: ${addValue} * ${numberOfPersons}`); // Log calculation for each item

            if (!isNaN(addValue)) {
                sum += addValue * numberOfPersons;
            }
        }
    });
    return sum;
}

function updateSumDisplay(targetClass, sum) {
    const formattedSum = sum.toFixed(2).replace('.', ',');
    $(`.${targetClass}`).text(formattedSum);
}

$('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
    if ($(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5')) {
        costPerCateringStaff = 0;
        $('.wrapper-equipier-traiteur').hide();
        $('#nombre-equipier-traiteur').text('0');
        console.log("ms-radio-button-tab-is-4 or ms-radio-button-tab-is-5 selected: Catering and Security staff set to 0");
    } else {
        costPerCateringStaff = YOUR_DEFAULT_CATERING_STAFF_COST;
        $('.wrapper-equipier-traiteur').show();
    }
    resetPricingCalculator();
});

function resetPricingCalculator() {
    $('.checkbox-devis-specialite-1, .checkbox-devis-specialite-2, .checkbox-devis-specialite-3, .checkbox-devis-petitdejeuner-1, .checkbox-devis-petitdejeuner-2, .checkbox-devis-dejeuner-1, .checkbox-devis-dejeuner-2, .checkbox-devis-dejeuner-3, .checkbox-devis-dejeuner-4, .checkbox-devis-pause, .checkbox-devis-diner-1, .checkbox-devis-diner-2, .checkbox-devis-diner-3').prop('checked', false);
    $('.price-specialite, .price-petitdejeuner, .price-dejeuner, .price-pause, .price-diner').text('0.00');
    $('.price-salle').text(initialPriceSalle);
    $('.price-traiteur-perso').text(initialPriceTraiteurPerso);
    $('.total-ht, .total-ttc, .price-tva').text(initialPriceSalle);
    $('.hack42-send-value').val(initialPriceSalle);
    if ($('.ms-radio-button-tab-is-4').prop('checked') || $('.ms-radio-button-tab-is-5').prop('checked')) {
        $('#nombre-equipier-traiteur').text('0');
        console.log("Resetting pricing calculator: Catering and Security staff maintained at 0 for radio 4 or 5"); 
    }
    updatePricesAndTotal();
}

$('.checkbox-devis-specialite-1, .checkbox-devis-specialite-2, .checkbox-devis-specialite-3, .checkbox-devis-petitdejeuner-1, .checkbox-devis-petitdejeuner-2, .checkbox-devis-dejeuner-1, .checkbox-devis-dejeuner-2, .checkbox-devis-dejeuner-3, .checkbox-devis-dejeuner-4, .checkbox-devis-pause, .checkbox-devis-diner-1, .checkbox-devis-diner-2, .checkbox-devis-diner-3').click(function() {
    updatePricesAndTotal();
});

$('.specialite-number-1, .specialite-number-2, .specialite-number-3, .petit-dejeuner-number-1, .petit-dejeuner-number-2, .dejeuner-number-1, .dejeuner-number-2, .dejeuner-number-3, .dejeuner-number-4, .pause-aprem-number-1, .diner-number-1, .diner-number-2, .diner-number-3').on('change keyup', function() {
    updatePricesAndTotal();
});

var Webflow = Webflow || [];
Webflow.push(function() {
    var observerConfig = { subtree: true, childList: true };
    var observer = new MutationObserver(function() {
        updatePriceField('.price-specialite', '#specialite-traiteur-prix');
        updatePriceField('.price-petitdejeuner', '#petit-dejeuner-prix');
        updatePriceField('.price-dejeuner', '#dejeuner-prix');
        updatePriceField('.price-pause', '#pause-apres-midi-prix');
        updatePriceField('.price-diner', '#diner-prix');
        updatePriceField('.price-traiteur-perso', '#cout-formule-traiteur-prix');
        updatePriceField('.price-tva', '#tva-prix');
        updatePriceField('.total-ht', '#prix-ht');
        updatePriceField('.total-ttc', '#prix-ttc');
        updatePriceField('.nombre-equipier-traiteur', '#staff-traiteur');
        updatePriceField('.nombre-securite', '#staff-securite');
        updatePriceField('.price-staff', '#prix-staff-total');
    

    });
    observer.observe(document.body, observerConfig);
});

function updatePriceField(sourceSelector, targetSelector) {
    var priceText = $(sourceSelector).text();
    $(targetSelector).val(priceText);
}

$('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
    if ($(this).hasClass('ms-radio-button-tab-is-4')) {
        initialPriceTraiteurPerso = 500;
    } else if ($(this).hasClass('ms-radio-button-tab-is-1') || $(this).hasClass('ms-radio-button-tab-is-2') || $(this).hasClass('ms-radio-button-tab-is-3')) {
        initialPriceTraiteurPerso = 120;
    } else {
        initialPriceTraiteurPerso = 0.00;
    }
    resetPricingCalculator();
});

$('.ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
    console.log("Radio button 4 or 5 clicked");
    updatePricesAndTotal();
});

$('.specialite-number-1, .specialite-number-2, .specialite-number-3, .petit-dejeuner-number-1, .petit-dejeuner-number-2, .dejeuner-number-1, .dejeuner-number-2, .dejeuner-number-3, .dejeuner-number-4, .pause-aprem-number-1, .diner-number-1, .diner-number-2, .diner-number-3').on('change keyup', function() {
    updatePricesAndTotal();
});
