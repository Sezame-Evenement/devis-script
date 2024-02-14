function isEventAfter22h00(eventTimeString) {
    const parts = eventTimeString.split(' au ');
    const endTimeString = parts.length > 1 ? parts[1] : '';
    const timePart = endTimeString.split('à')[1].trim(); 
    const [hours, minutes] = timePart.split('h').map(Number);

    console.log(`isEventAfter22h00: Event ends at ${hours}h${minutes}`);

    return hours >= 22 || (hours < 6 && hours >= 0);
}


$(document).ready(function() {
    const initialAttendees = $('#nb-personnes-final-2').attr('data');
    $('#nb-personnes-final-2').val(initialAttendees);

    initialPriceTraiteurPerso = 120;
    $('.price-traiteur-perso').text(initialPriceTraiteurPerso); // Set the initial UI element to 120


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
    console.log(`updateSecurityStaff called with eventTimeString: ${eventTimeString}, numberOfAttendees: ${numberOfAttendees}`);

    if ($('.wrapper-security').is(':visible')) {
        if (isEventAfter22h00(eventTimeString)) {
            const securityTeamMembers = getNumberOfSecurityMembers(numberOfAttendees);
            $('#nombre-securite').text(securityTeamMembers);
        } else {
            $('#nombre-securite').text(0);
        }
    } else {
        $('#nombre-securite').text(0);
    }
    
}







$('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {

    let isRadio4Or5 = $(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5');

    if (isRadio4Or5) {
        $('#nombre-equipier-traiteur').text('0'); // No catering staff needed for options 4 or 5
    } else {
        updateTeamMembers();
    }
    resetPricingCalculator();
    updatePricesAndTotal(); // No need to pass isRadio4Or5 since we can check inside the function
});



function formatTime(decimalTime) {
    // Adjust time to wrap around if it exceeds 24 hours
    let adjustedTime = decimalTime % 24;
    let hours = Math.floor(adjustedTime);
    let minutes = Math.round((adjustedTime - hours) * 60);

    // Format hours and minutes to ensure two digits
    let hoursFormatted = hours.toString().padStart(2, '0');
    let minutesFormatted = minutes.toString().padStart(2, '0');

    return `${hoursFormatted}h${minutesFormatted}`;
}



function updatePricesAndTotal() {
    console.log("Starting updatePricesAndTotal function...");
    let isRadio4Or5Checked = $('.ms-radio-button-tab-is-4:checked, .ms-radio-button-tab-is-5:checked').length > 0;
    console.log("Radio 4 or 5 checked:", isRadio4Or5Checked);

    // Parse event time string
    const eventTimeString = $('#data-text-item-check').text();
    console.log("Event Time String:", eventTimeString);
    const [startTime, endTime] = eventTimeString.split(' au ').map(part => part.split('à')[1].trim());
    const [startHour, startMinute] = startTime.split('h').map(Number);
    const [endHour, endMinute] = endTime.split('h').map(Number);

    let eventStartDecimal = startHour + startMinute / 60;
    let eventEndDecimal = endHour + endMinute / 60;
    if (eventEndDecimal < eventStartDecimal) eventEndDecimal += 24; // Adjust for next day

    console.log(`Event starts at ${eventStartDecimal} and ends at ${eventEndDecimal}`);

    // Initialize variables for staff arrival and departure times
    let regisseurArrival = eventStartDecimal - (isRadio4Or5Checked ? 1 : 2);
    let regisseurDeparture = eventEndDecimal + 1;
    let cateringArrival, cateringDeparture;
    
    if (!isRadio4Or5Checked) {
        cateringArrival = eventStartDecimal - 2;
        cateringDeparture = eventEndDecimal + 1;
    }

    // Calculate working hours, ensuring no negative values
    let regisseurHours = regisseurDeparture - regisseurArrival;
    let cateringHours = !isRadio4Or5Checked ? cateringDeparture - cateringArrival : 0;
    let securityArrival, securityDeparture;
    if (eventStartDecimal < 18) {
        securityArrival = 17.5; // If event starts before 18h, security arrives at 17h30
    } else {
        // If event starts at/after 18h or is after 22h00, security arrives 30 mins before
        securityArrival = eventStartDecimal >= 18 ? eventStartDecimal - 0.5 : 17.5;
    }
    securityDeparture = eventEndDecimal + 0.5; // Security leaves 30 mins after event ends

    // Now calculate securityHours using the defined arrival and departure times
    securityHours = securityDeparture - securityArrival;
    if (securityHours < 0) securityHours += 24; // Adjust for events that end the next day

    console.log(`Security arrival: ${securityArrival}, departure: ${securityDeparture}, hours: ${securityHours}`);


    // Security staff timing logic adjusted per requirements
    if (eventStartDecimal < 18) {
        // If event starts before 18h, security arrives at 17h30
        securityArrival = 17.5;
    } else if (eventStartDecimal >= 18 || isEventAfter22h00(eventTimeString)) {
        // If event starts at/after 18h or is after 22h00, security arrives 30 mins before
        securityArrival = eventStartDecimal - 0.5;
    }
    securityDeparture = eventEndDecimal + 0.5; // Security leaves 30 mins after event ends

    console.log(`Security arrival: ${securityArrival}, departure: ${securityDeparture}`);

    // Continue with the logic for calculating staff costs...




    // Determine the number of staff based on attendees
    const numberOfAttendees = parseInt($('#nb-personnes-final-2').val(), 10);
    console.log(`Number of Attendees: ${numberOfAttendees}`);
    
    // Retrieve the number of each staff category
    let numberOfCateringStaff = isRadio4Or5Checked ? 0 : getNumberOfCateringTeamMembers(numberOfAttendees);
    let numberOfSecurityStaff = getNumberOfSecurityMembers(numberOfAttendees);
    let numberOfRegisseurs = 1; // Assuming a single Regisseur for simplicity

    console.log(`Staff numbers - Catering: ${numberOfCateringStaff}, Security: ${numberOfSecurityStaff}, Regisseur: ${numberOfRegisseurs}`);

    // Calculate staff costs based on predefined rates and hours worked
    const regisseurRate = 40; // Placeholder rate
    const cateringRate = 35; // Placeholder rate
    const securityRate = 30; // Placeholder rate
    
    let regisseurCost = regisseurHours * regisseurRate * numberOfRegisseurs;
    let cateringCost = cateringHours * cateringRate * numberOfCateringStaff;
    let securityCost = securityHours * securityRate * numberOfSecurityStaff; // Use the correctly scoped securityHours

    console.log(`Cost calculations - Regisseur: ${regisseurCost}, Catering: ${cateringCost}, Security: ${securityCost}`);

    // Construct the display messages for each staff category
    let regisseurMessage = `Le staff regisseur sera présent de ${formatTime(regisseurArrival)} jusqu'à ${formatTime(regisseurDeparture)} pour un montant de ${regisseurCost.toFixed(2)}€ pour un total de ${regisseurHours} heures.`;
    let cateringMessage = !isRadio4Or5Checked ? `Le staff traiteur sera présent de ${formatTime(cateringArrival)} jusqu'à ${formatTime(cateringDeparture)} pour un montant de ${cateringCost.toFixed(2)}€ pour un total de ${cateringHours} heures.` : "";
    let securityMessage = `Le staff sécurité sera présent de ${formatTime(securityArrival)} jusqu'à ${formatTime(securityDeparture)} pour un montant de ${securityCost.toFixed(2)}€ pour un total de ${securityHours} heures.`;

    // Update the UI with these messages
    $('#temps-staff-regisseur').text(regisseurMessage);
    if (!isRadio4Or5Checked) {
        $('#temps-staff-traiteur').text(cateringMessage);
    }
    $('#temps-staff-securite').text(securityMessage);

    // Proceed to finalizing the total costs and updating additional UI elements...


 // Finalize total cost calculations
 let totalStaffCost = regisseurCost + cateringCost + securityCost;
 console.log(`Total staff cost: ${totalStaffCost.toFixed(2)}€`);

 // Item and meal cost calculations (assumed to remain unchanged from your script)
 let sumSpecialite = calculateCategorySum('checkbox-devis-specialite-1', Number($('.specialite-number-1').val())) +
     calculateCategorySum('checkbox-devis-specialite-2', Number($('.specialite-number-2').val())) +
     calculateCategorySum('checkbox-devis-specialite-3', Number($('.specialite-number-3').val()));
 let sumPetitdejeuner = calculateCategorySum('checkbox-devis-petitdejeuner-1', Number($('.petit-dejeuner-number-1').val())) +
     calculateCategorySum('checkbox-devis-petitdejeuner-2', Number($('.petit-dejeuner-number-2').val()));
 let sumDejeuner = calculateCategorySum('checkbox-devis-dejeuner-1', Number($('.dejeuner-number-1').val())) +
     calculateCategorySum('checkbox-devis-dejeuner-2', Number($('.dejeuner-number-2').val())) +
     calculateCategorySum('checkbox-devis-dejeuner-3', Number($('.dejeuner-number-3').val())) +
     calculateCategorySum('checkbox-devis-dejeuner-4', Number($('.dejeuner-number-4').val()));
 let sumPause = calculateCategorySum('checkbox-devis-pause', Number($('.pause-aprem-number-1').val()));
 let sumDiner = calculateCategorySum('checkbox-devis-diner-1', Number($('.diner-number-1').val())) +
     calculateCategorySum('checkbox-devis-diner-2', Number($('.diner-number-2').val())) +
     calculateCategorySum('checkbox-devis-diner-3', Number($('.diner-number-3').val()));

 let totalMealAndItemCost = sumSpecialite + sumPetitdejeuner + sumDejeuner + sumPause + sumDiner;

 // Calculate total before taxes
 let totalBeforeTaxes = totalStaffCost + totalMealAndItemCost + initialPriceSalle + initialPriceTraiteurPerso;

 // Calculate TVA (tax)
 let totalTVA = totalBeforeTaxes * tvaRate; // Assuming tvaRate is defined as 0.2 (20%)

 // Calculate final totals
 let totalHT = totalBeforeTaxes;
 let totalTTC = totalHT + totalTVA;

 // Update the UI with the calculated values
 $('.total-ht').text(totalHT.toFixed(2).replace('.', ','));
 $('.total-ttc').text(totalTTC.toFixed(2).replace('.', ','));
 $('.price-tva').text(totalTVA.toFixed(2).replace('.', ','));

 // Update hidden input for form submission with the total HT value
 $('.hack42-send-value').val(totalHT.toFixed(2));

 console.log("Finished updating prices and total.");
}



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

function formatTime(decimalTime) {
    let hours = Math.floor(decimalTime % 24);
    let minutes = Math.round((decimalTime - hours) * 60);
    return `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}`;
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
