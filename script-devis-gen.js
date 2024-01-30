<script>

$(document).ready(function() {
$('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').each(function() {
console.log($(this).attr('class') + " checked:", $(this).prop('checked'));
});
$('.ms-radio-button-tab-is-1').prop('checked', true);
initialPriceTraiteurPerso = 120;
$('.price-traiteur-perso').text(initialPriceTraiteurPerso);
updatePricesAndTotal();
});

$('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
    if ($(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5')) {
        costPerCateringStaff = 0;
    } else {
        costPerCateringStaff = YOUR_DEFAULT_CATERING_STAFF_COST;
    }
    updatePricesAndTotal();
});

let initialPriceSalle = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
let initialPriceTraiteurPerso = 0;
let costPerCateringStaff = 0;

const updatePricesAndTotal = () => {


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

let isSpecialRateApplied = isRadio4Checked || isRadio5Checked;
console.log("Is Special Rate Applied:", isSpecialRateApplied);

let totalCostCateringStaff = 0;

if (!isSpecialRateApplied) {
    let numberOfCateringStaff = Number($('#nombre-equipier-traiteur').text());
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

const formattedTotalHT = totalHT.toFixed(2).replace('.', ',');
const formattedTotalTTC = totalTTC.toFixed(2).replace('.', ',');
const formattedTVA = totalTVA.toFixed(2).replace('.', ',');

$('.total-ht').text(formattedTotalHT);
$('.total-ttc').text(formattedTotalTTC);
$('.price-tva').text(formattedTVA);

$('.hack42-send-value').val(formattedTotalHT);
};

$('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
if ($(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5')) {
costPerCateringStaff = 0;
} else {
}
resetPricingCalculator();
});

const calculateCategorySum = (className, numberOfPersons) => {
let sum = 0;
$(`.${className}`).each(function() {
const $checkbox = $(this);
if ($checkbox.prop('checked')) {
const addValue = Number($checkbox.attr('add-value').replace(',', '.'));
if (!isNaN(addValue)) {
sum += addValue * numberOfPersons;
}
}
});
return sum;
};

const updateSumDisplay = (targetClass, sum) => {
const formattedSum = sum.toFixed(2).replace('.', ',');
$(`.${targetClass}`).text(formattedSum);
};

const resetPricingCalculator = () => {
$('.checkbox-devis-specialite-1, .checkbox-devis-specialite-2, .checkbox-devis-specialite-3, .checkbox-devis-petitdejeuner-1, .checkbox-devis-petitdejeuner-2, .checkbox-devis-dejeuner-1, .checkbox-devis-dejeuner-2, .checkbox-devis-dejeuner-3, .checkbox-devis-dejeuner-4, .checkbox-devis-pause, .checkbox-devis-diner-1, .checkbox-devis-diner-2, .checkbox-devis-diner-3').prop('checked', false);
$('.price-specialite, .price-petitdejeuner, .price-dejeuner, .price-pause, .price-diner').text('0.00');
$('.price-salle').text(initialPriceSalle);
$('.price-traiteur-perso').text(initialPriceTraiteurPerso);
$('.total-ht, .total-ttc, .price-tva').text(initialPriceSalle);
$('.hack42-send-value').val(initialPriceSalle);
updatePricesAndTotal();
};

$('.checkbox-devis-specialite-1, .checkbox-devis-specialite-2, .checkbox-devis-specialite-3, .checkbox-devis-petitdejeuner-1, .checkbox-devis-petitdejeuner-2, .checkbox-devis-dejeuner-1, .checkbox-devis-dejeuner-2, .checkbox-devis-dejeuner-3, .checkbox-devis-dejeuner-4, .checkbox-devis-pause, .checkbox-devis-diner-1, .checkbox-devis-diner-2, .checkbox-devis-diner-3').click(function() {
updatePricesAndTotal();
});

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
});
observer.observe(document.body, observerConfig);
});

function updatePriceField(sourceSelector, targetSelector) {
var priceText = $(sourceSelector).text();
$(targetSelector).val(priceText);
}

</script>
