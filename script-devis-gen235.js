function isEventAfter22h00(eventTimeString) {
    const parts = eventTimeString.split(' au ');
    const endTimeString = parts.length > 1 ? parts[1] : '';
    if (endTimeString === '') {
        console.error('isEventAfter22h00: Invalid eventTimeString, cannot determine end time.');
        return false; // Or handle this case as appropriate for your application
    }
    const timePart = endTimeString.split('à')[1].trim();
    const [hours, minutes] = timePart.split('h').map(Number);

    console.log(`isEventAfter22h00: Event ends at ${hours}h${minutes}`);

    return hours >= 22 || (hours < 6 && hours >= 0);
}


$(document).ready(function() {
    // Default selection of Radio 1 if none is selected
    if (!$('input[name="Choix-traiteur"]:checked').length) {
        $('#Traiteur-n-1').prop('checked', true);
        console.log("Radio 1 selected by default");
    }

    // Initial setup
    const initialAttendees = $('#nb-personnes-final-2').attr('data');
    $('#nb-personnes-final-2').val(initialAttendees);
    const initialPriceTraiteurPerso = 120;
    $('.price-traiteur-perso').text(initialPriceTraiteurPerso);

    // Initial update calls
    updateTeamMembers();
    triggerUpdatePricesAndTotal();

    // Radio button click event
    $('input[name="Choix-traiteur"]').change(function() {
        console.log(`Radio button clicked: ${$(this).attr('class')}`);
        updateTeamMembers();
        resetPricingCalculator();
        triggerUpdatePricesAndTotal();
    });

    // Attendees input change event
    $('#nb-personnes-final-2').on('input', function() {
        console.log("Number of attendees changed");
        updateTeamMembers();
        triggerUpdatePricesAndTotal();
    });

    // Security staff update based on event time
    const eventTimeString = $('#data-text-item-check').text();
    updateSecurityStaffBasedOnEventTime(eventTimeString);
});

function triggerUpdatePricesAndTotal() {
    let selectedValue = $('input[name="Choix-traiteur"]:checked').val();
    console.log(`Selected Traiteur Value: ${selectedValue}`); // Debugging log

    let isRadio4Or5Selected = selectedValue === 'Traiteur personnalisé' || selectedValue === 'Pas de traiteur';
    let isRadio1To3Selected = ['Traiteur n°1', 'Traiteur n°2', 'Traiteur n°3'].includes(selectedValue);
    console.log(`isRadio4Or5Selected: ${isRadio4Or5Selected}, isRadio1To3Selected: ${isRadio1To3Selected}`); // Debugging log

    updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected);
}


function updateSecurityStaffBasedOnEventTime(eventTimeString) {
    console.log(`updateSecurityStaffBasedOnEventTime: ${eventTimeString}`);
    if (isEventAfter22h00(eventTimeString)) {
        console.log("Event is after 22h00, showing security wrapper");
        $('.wrapper-security').show();
        // Update security staff members based on attendees
        updateSecurityStaff(eventTimeString, $('#nb-personnes-final-2').val());
    } else {
        console.log("Event is not after 22h00, hiding security wrapper");
        $('.wrapper-security').hide();
        $('#nombre-securite').text('0');
    }
}

// Note: Make sure all other functions like updatePricesAndTotal, updateTeamMembers, 
// updateSecurityStaff, and isEventAfter22h00 are defined and correctly implemented as needed.







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



$('input[name="Choix-traiteur"]').change(function() {
    let selectedValue = $('input[name="Choix-traiteur"]:checked').val();

    let isRadio4Or5Selected = selectedValue === 'Traiteur personnalisé' || selectedValue === 'Pas de traiteur';
    let isRadio1To3Selected = ['Traiteur n°1', 'Traiteur n°2', 'Traiteur n°3'].includes(selectedValue);

    resetPricingCalculator();
    updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected);
    updateTeamMembers();
});

function updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected) {
    const eventTimeString = $('#data-text-item-check').text();
    const [startTime, endTime] = eventTimeString.split(' au ').map(part => part.split('à')[1].trim());
    const [startHour, startMinute] = startTime.split('h').map(Number);
    const [endHour, endMinute] = endTime.split('h').map(Number);
    let eventStartHour = startHour + startMinute / 60;
    let eventEndHour = endHour + endMinute / 60;
    if (eventEndHour < eventStartHour) eventEndHour += 24; // Adjust for events ending after midnight

    const numberOfCateringStaff = Number($('#nombre-equipier-traiteur').text());
    const numberOfSecurityStaff = Number($('#nombre-securite').text());
    const numberOfRegisseurs = Number($('#nombre-regisseur').text());

    let securityArrival, securityDeparture;
    if (eventStartHour >= 18 || eventStartHour <= 6) {
        securityArrival = eventStartHour - 0.5;
    } else {
        securityArrival = 17.5;
    }
    securityDeparture = eventEndHour + 0.5;
    if (securityArrival < 0) securityArrival += 24;

    let securityHoursWorked = securityDeparture - securityArrival;
    if (securityHoursWorked < 0) securityHoursWorked += 24;
    const securityStaffCost = numberOfSecurityStaff * 35 * securityHoursWorked;

    console.log(`Security Staff: Hours Worked = ${securityHoursWorked}, Cost = ${securityStaffCost.toFixed(2)}€`);

    let cateringArrival = isRadio1To3Selected ? eventStartHour - 2 : null;
    let cateringDeparture = isRadio1To3Selected ? eventEndHour + 1 : null;
    let regisseurArrival = isRadio1To3Selected ? eventStartHour - 2 : eventStartHour - 1;
    let regisseurDeparture = eventEndHour + 1;

    const YOUR_DEFAULT_CATERING_STAFF_COST = 35;
    const regisseurCost = numberOfRegisseurs * 40 * (regisseurDeparture - regisseurArrival);
    const cateringStaffCost = isRadio1To3Selected ? numberOfCateringStaff * YOUR_DEFAULT_CATERING_STAFF_COST * (cateringDeparture - cateringArrival) : 0;

    console.log(`Catering Staff: Hours Worked = ${cateringDeparture - cateringArrival}, Cost = ${cateringStaffCost.toFixed(2)}€`);
    console.log(`Regisseur: Hours Worked = ${regisseurDeparture - regisseurArrival}, Cost = ${regisseurCost.toFixed(2)}€`);

  // For security staff
const securityStaffMessage = `Le staff sécurité arrivera à ${formatTime(securityArrival)} et partira à ${formatTime(securityDeparture)}. Pour un total de ${securityStaffCost.toFixed(2)}€.`;
$('#temps-staff-securite').text(securityStaffMessage);
$('#staff-securite-text').val(securityStaffMessage); // Set value for input
$('.temps-staff-securite-e2').text(securityStaffMessage); // Set text for block

// For catering staff
const cateringStaffMessage = isRadio1To3Selected ? `Le staff traiteur arrivera à ${formatTime(cateringArrival)} et partira à ${formatTime(cateringDeparture)}. Pour un total de ${cateringStaffCost.toFixed(2)}€.` : "";
$('#temps-staff-traiteur').text(cateringStaffMessage);
$('#staff-traiteur-text').val(cateringStaffMessage); // Set value for input
$('.temps-staff-traiteur-e2').text(cateringStaffMessage); // Set text for block

// For stage manager (régisseur)
const regisseurMessage = `Le staff régisseur arrivera à ${formatTime(regisseurArrival)} et partira à ${formatTime(regisseurDeparture)}. Pour un total de ${regisseurCost.toFixed(2)}€.`;
$('#temps-regisseur').text(regisseurMessage);
$('#staff-regisseur-text').val(regisseurMessage); // Set value for input
$('.temps-regisseur-e2').text(regisseurMessage); // Set text for block


    const totalStaffCost = cateringStaffCost + securityStaffCost + regisseurCost;
    console.log(`Total Staff Cost: ${totalStaffCost.toFixed(2)}€`);
    $('#total-staff').text((cateringStaffCost + securityStaffCost + regisseurCost).toFixed(2).replace('.', ','));


  
   
// Item and meal cost calculations
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

// Update the UI for each category using the updateSumDisplay function
updateSumDisplay('price-specialite', sumSpecialite);
updateSumDisplay('price-petitdejeuner', sumPetitdejeuner);
updateSumDisplay('price-dejeuner', sumDejeuner);
updateSumDisplay('price-pause', sumPause);
updateSumDisplay('price-diner', sumDiner);

// Sum up all item and meal costs
let totalMealAndItemCost = sumSpecialite + sumPetitdejeuner + sumDejeuner + sumPause + sumDiner;

// Apply 10% TVA for meal costs
const mealTvaRate = 0.1; // 10%
let mealTVA = totalMealAndItemCost * mealTvaRate;

// Room and personal catering service cost
const priceSalle = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
const priceTraiteurPerso = Number($('.price-traiteur-perso').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));

// Total cost before taxes for non-meal items
let nonMealCosts = totalStaffCost + priceSalle + priceTraiteurPerso;
const nonMealTvaRate = 0.2; // 20% for non-meal items
let nonMealTVA = nonMealCosts * nonMealTvaRate;

// Total TVA
let totalTVA = mealTVA + nonMealTVA;

// Calculate total before taxes
let totalBeforeTaxes = totalMealAndItemCost + nonMealCosts;

// Calculate final totals
let totalHT = totalBeforeTaxes;
let totalTTC = totalHT + totalTVA;

// Update the UI with the calculated values
$('.total-ht').text(totalHT.toFixed(2).replace('.', ','));
$('.total-ttc').text(totalTTC.toFixed(2).replace('.', ','));
$('.price-tva').text(totalTVA.toFixed(2).replace('.', ','));

// Update hidden input for form submission
$('.hack42-send-value').val(totalHT.toFixed(2));

}

function formatTime(time) {
    let hours = Math.floor(time) % 24; // Wrap around if hours exceed 24
    let minutes = Math.floor((time - Math.floor(time)) * 60);
    return `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}`;
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

function updateSumDisplay(targetClass, sum) {
    const formattedSum = sum.toFixed(2).replace('.', ',');
    $(`.${targetClass}`).text(formattedSum); // Make sure the class matches your HTML elements
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
    $('.total-ht, .total-ttc, .price-tva').text('0.00'); // Assuming you want to reset these to zero
    $('.hack42-send-value').val('0.00'); // Assuming you want to reset this to zero as well

    let selectedValue = $('input[name="Choix-traiteur"]:checked').val();
    let isRadio4Or5Selected = selectedValue === 'Traiteur personnalisé' || selectedValue === 'Pas de traiteur';
    let isRadio1To3Selected = ['Traiteur n°1', 'Traiteur n°2', 'Traiteur n°3'].includes(selectedValue);
    updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected);
}


$('.checkbox-devis-specialite-1, .checkbox-devis-specialite-2, .checkbox-devis-specialite-3, .checkbox-devis-petitdejeuner-1, .checkbox-devis-petitdejeuner-2, .checkbox-devis-dejeuner-1, .checkbox-devis-dejeuner-2, .checkbox-devis-dejeuner-3, .checkbox-devis-dejeuner-4, .checkbox-devis-pause, .checkbox-devis-diner-1, .checkbox-devis-diner-2, .checkbox-devis-diner-3').click(function() {
    triggerUpdatePricesAndTotal(); // Assuming you have a function to determine the state and call updatePricesAndTotal
});

$('.specialite-number-1, .specialite-number-2, .specialite-number-3, .petit-dejeuner-number-1, .petit-dejeuner-number-2, .dejeuner-number-1, .dejeuner-number-2, .dejeuner-number-3, .dejeuner-number-4, .pause-aprem-number-1, .diner-number-1, .diner-number-2, .diner-number-3').on('change keyup', function() {
    triggerUpdatePricesAndTotal(); // Using the same assumed trigger function
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
    let isRadio4Or5Selected = $(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5');
    let isRadio1To3Selected = !isRadio4Or5Selected; // Since clicking 4 or 5 means 1 to 3 are not selected
    updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected);
});

$('.specialite-number-1, .specialite-number-2, .specialite-number-3, .petit-dejeuner-number-1, .petit-dejeuner-number-2, .dejeuner-number-1, .dejeuner-number-2, .dejeuner-number-3, .dejeuner-number-4, .pause-aprem-number-1, .diner-number-1, .diner-number-2, .diner-number-3').on('change keyup', function() {
    // For these, you need to reassess the radio button state each time
    let selectedValue = $('input[name="Choix-traiteur"]:checked').val();
    let isRadio4Or5Selected = selectedValue === 'Traiteur personnalisé' || selectedValue === 'Pas de traiteur';
    let isRadio1To3Selected = ['Traiteur n°1', 'Traiteur n°2', 'Traiteur n°3'].includes(selectedValue);
    updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected);
});

function copyTextToPlaceholderAndBlock(sourceSelector, inputSelector, textSelector) {
    var sourceText = $(sourceSelector).text().trim(); // Get the text from the source element
    console.log(`Copied text '${sourceText}' from ${sourceSelector} to ${inputSelector} and ${textSelector}`);

    $(inputSelector).attr('placeholder', sourceText); // Set the placeholder for the input field
    $(textSelector).text(sourceText); // Set the text for the specified elements
}

// Execute the function for each matching pair of source and target elements
copyTextToPlaceholderAndBlock('#temps-staff-traiteur', '#staff-traiteur-text', '.temps-staff-traiteur-e2');
copyTextToPlaceholderAndBlock('#temps-regisseur', '#staff-regisseur-text', '.temps-regisseur-e2');
copyTextToPlaceholderAndBlock('#temps-staff-securite', '#staff-securite-text', '.temps-staff-securite-e2');

