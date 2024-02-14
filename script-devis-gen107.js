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
    console.log(`Radio button clicked: ${$(this).attr('class')}`);

    let isRadio4Or5 = $(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5');
    if (isRadio4Or5) {
        $('#nombre-equipier-traiteur').text('0');
    } else {
        updateTeamMembers(); 
    }
    resetPricingCalculator();
});


function updatePricesAndTotal() {
    console.log("updatePricesAndTotal called");

    let isRadio4Or5Checked = $('.ms-radio-button-tab-is-4:checked, .ms-radio-button-tab-is-5:checked').length > 0;
    
    // Event time parsing and duration calculation
    const eventTimeString = $('#data-text-item-check').text();
    const [startTime, endTime] = eventTimeString.split(' au ').map(part => part.split('à')[1].trim());
    const [startHour, startMinute] = startTime.split('h').map(Number);
    const [endHour, endMinute] = endTime.split('h').map(Number);

    let eventStartHour = startHour + startMinute / 60;
    let eventEndHour = endHour + endMinute / 60;
    if (eventEndHour < eventStartHour) eventEndHour += 24; // Adjust for events ending after midnight

    // Adjust security staff start time based on event start time
    let securityStartTime = (startHour < 18) ? 17.5 : eventStartHour - 0.5;
    if (securityStartTime < 0) securityStartTime += 24; // Normalize for events starting late

    let securityEndTime = eventEndHour + 0.5; // Security leaves 30 minutes after event ends
    if (securityEndTime >= 24) securityEndTime -= 24; // Adjust if exceeds 24 hours

    // Calculate the presence hours of security staff
    let securityPresenceHours = securityEndTime - securityStartTime;
    if (securityPresenceHours < 0) securityPresenceHours += 24; // Adjust if spans past midnight

    // Define staff counts
    const numberOfCateringStaff = isRadio4Or5Checked ? 0 : Number($('#nombre-equipier-traiteur').text());
    const numberOfSecurityStaff = Number($('#nombre-securite').text());
    const numberOfRegisseurs = Number($('#nombre-regisseur').text());

    // Calculate staff costs
    const YOUR_DEFAULT_CATERING_STAFF_COST = 35; // Ensure this value is correctly set according to your application
    const cateringStaffCost = numberOfCateringStaff * YOUR_DEFAULT_CATERING_STAFF_COST * (eventEndHour - eventStartHour + 3); // Catering staff hours
    const securityStaffCost = numberOfSecurityStaff * 35 * securityPresenceHours; // Assuming $35/hour for security
    const regisseurCost = numberOfRegisseurs * 40 * (eventEndHour - eventStartHour + 3); // Assuming $40/hour for régisseur

    const totalStaffCost = cateringStaffCost + securityStaffCost + regisseurCost;

    $('#total-staff').text(totalStaffCost.toFixed(2).replace('.', ','));






    // Update staff presence messages
    let securityMessage = numberOfSecurityStaff > 1 ? 
        `Les agent(es) de sécurité seront présents de ${formatTime(securityStartTimeAdjust)} jusqu'à ${formatTime(securityEndTimeAdjust)} pour un montant de 35€/h soit ${securityStaffCost.toFixed(2)}€` :
        `L'agent(e) de sécurité sera présent de ${formatTime(securityStartTimeAdjust)} jusqu'à ${formatTime(securityEndTimeAdjust)} pour un montant de 35€/h soit ${securityStaffCost.toFixed(2)}€`;

    // Catering staff message
    let cateringMessage = `Le staff traiteur sera présent de ${formatTime(eventStartHour - 2)} jusqu'à ${formatTime(eventEndHour + 1)} pour un montant de ${YOUR_DEFAULT_CATERING_STAFF_COST}€/h soit ${cateringStaffCost.toFixed(2)}€`;

    // Régisseur message
    let regisseurMessage = `Le régisseur ou la régisseuse sera présent(e) de ${formatTime(eventStartHour - 2)} jusqu'à ${formatTime(eventEndHour + 1)} pour un montant de 40€/h soit ${regisseurCost.toFixed(2)}€`;

    // Conditionally display messages based on staff presence
    if (numberOfSecurityStaff > 0) {
        $('#temps-staff-securite').text(securityMessage);
    } else if (!isEventAfter22h00(eventTimeString)) {
        $('#temps-staff-securite').text(''); // Hide or clear message if security not needed
    }
    
    if (numberOfCateringStaff > 0) {
        $('#temps-staff-traiteur').text(cateringMessage);
    }
    
    $('#temps-regisseur').text(regisseurMessage);

   
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

// Sum up all item and meal costs
let totalMealAndItemCost = sumSpecialite + sumPetitdejeuner + sumDejeuner + sumPause + sumDiner;

// Room and personal catering service cost
const priceSalle = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
const priceTraiteurPerso = Number($('.price-traiteur-perso').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));

// Calculate total before taxes
let totalBeforeTaxes = totalStaffCost + totalMealAndItemCost + priceSalle + priceTraiteurPerso;

// Calculate TVA (tax)
const tvaRate = 0.2; // 20%
let totalTVA = totalBeforeTaxes * tvaRate;

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
    let hour = Math.floor(time);
    let minute = Math.floor((time % 1) * 60);
    return `${hour.toString().padStart(2, '0')}h${minute.toString().padStart(2, '0')}`;
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

