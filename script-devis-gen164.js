$(document).ready(function() {
    let initialPriceSalle = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
    let initialPriceTraiteurPerso = 120;
    let YOUR_DEFAULT_CATERING_STAFF_COST = 35; // Declare this variable globally
    let costPerCateringStaff = YOUR_DEFAULT_CATERING_STAFF_COST;

    $('#nb-personnes-final-2').val($('#nb-personnes-final-2').attr('data'));
    $('.price-traiteur-perso').text(initialPriceTraiteurPerso);

    updateTeamMembers();
    updatePricesAndTotal();

    $('.ms-radio-button-tab').click(function() {
        if ($(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5')) {
            adjustSecurityAndRegisseurForEventSpecial();
        } else {
            costPerCateringStaff = YOUR_DEFAULT_CATERING_STAFF_COST;
            $('.wrapper-equipier-traiteur').show();
            updateTeamMembers();
        }
        resetPricingCalculator();
    });

    $('#nb-personnes-final-2').on('input', function() {
        updateTeamMembers();
        updatePricesAndTotal();
    });
});

function updateTeamMembers() {
    const numberOfAttendees = parseInt($('#nb-personnes-final-2').val(), 10);
    $('#nombre-equipier-traiteur').text(getNumberOfCateringTeamMembers(numberOfAttendees));
    updateSecurityStaff($('#data-text-item-check').text(), numberOfAttendees);
}

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
    return cateringTeamSize ? cateringTeamSize.team : 0;
}

function updateSecurityStaff(eventTimeString, numberOfAttendees) {
    const isAfter22 = isEventAfter22h00(eventTimeString);
    $('#nombre-securite').text(isAfter22 ? 1 : 0);
}

function isEventAfter22h00(eventTimeString) {
    const parts = eventTimeString.split(' au ');
    const endTimeString = parts[1] ? parts[1] : '';
    const timePart = endTimeString.split('à')[1].trim();
    const [hours, ] = timePart.split('h').map(Number);
    return hours >= 22 || hours < 6;
}

function adjustSecurityAndRegisseurForEventSpecial() {
    $('#nombre-equipier-traiteur').text('0');
    $('.wrapper-equipier-traiteur').hide();
    const eventTimeString = $('#data-text-item-check').text();
    $('#nombre-securite').text(isEventAfter22h00(eventTimeString) ? calculateSecurityTeamSize(parseInt($('#nb-personnes-final-2').val(), 10)) : 0);
}

function calculateSecurityTeamSize(numberOfAttendees) {
    const securityBrackets = [
        { min: 0, max: 99, team: 1 },
        { min: 100, max: 199, team: 2 },
        { min: 200, max: 299, team: 3 },
        { min: 300, max: 399, team: 4 },
        { min: 400, max: 499, team: 5 },
        { min: 500, max: 599, team: 6 },
        { min: 600, max: 699, team: 7 },
        { min: 700, max: 799, team: 8 },
        { min: 800, max: 899, team: 9 },
        { min: 900, max: 999, team: 10 }
    ];
    let securityTeamSize = securityBrackets.find(bracket => numberOfAttendees >= bracket.min && numberOfAttendees <= bracket.max);
    return securityTeamSize ? securityTeamSize.team : 0;
}

function resetPricingCalculator() {
    $('.checkbox-devis').prop('checked', false);
    $('.price-specialite, .price-petitdejeuner, .price-dejeuner, .price-pause, .price-diner').text('0.00');
    updatePricesAndTotal();
}

function updatePricesAndTotal() {
    let totalCost = 0;
    const baseCost = parseFloat($('.price-salle').text()) || 0;
    const cateringCost = parseInt($('#nombre-equipier-traiteur').text(), 10) * YOUR_DEFAULT_CATERING_STAFF_COST * parseFloat($('#nb-personnes-final-2').val());
    const securityCost = parseInt($('#nombre-securite').text(), 10) * 35; // Assuming a flat rate for security staff
    totalCost = baseCost + cateringCost + securityCost;
    $('.total-price').text(totalCost.toFixed(2));
}

$('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3').click(function() {
    costPerCateringStaff = YOUR_DEFAULT_CATERING_STAFF_COST;
    $('.wrapper-equipier-traiteur').show();
    updateTeamMembers();
    resetPricingCalculator();
});

$('.ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
    $('.wrapper-equipier-traiteur, .wrapper-security').hide();
    $('#nombre-equipier-traiteur, #nombre-securite').text('0');
    adjustForRadio4Or5();
});

function adjustForRadio4Or5() {
    const eventTimeString = $('#data-text-item-check').text();
    if (isEventAfter22h00(eventTimeString)) {
        $('.wrapper-security').show();
        $('#nombre-securite').text(calculateSecurityTeamSize(parseInt($('#nb-personnes-final-2').val(), 10)));
    }
    resetPricingCalculator();
}

$('#data-text-item-check').on('input', function() {
    updateTeamMembers();
    updatePricesAndTotal();
});

// Additional dynamic UI updates for changes in selections or configurations
$('input[type="checkbox"].checkbox-devis, input[type="number"]').on('change', function() {
    updatePricesAndTotal();
});


