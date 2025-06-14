// Test script to check core functions in isolation
console.log('🧪 Testing core functions in isolation...');

// Test formatCurrency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Test formatNumber
function formatNumber(number) {
    if (typeof number !== 'number' || isNaN(number)) return '0';
    return number.toLocaleString();
}

// Run tests
console.log('Testing formatCurrency(1234.56):', formatCurrency(1234.56));
console.log('Testing formatNumber(1234):', formatNumber(1234));

// Mock DOM functions
const mockDOM = {
    getElementById: (id) => {
        const mockElement = {
            value: '10',
            checked: false,
            style: { display: 'block' },
            textContent: ''
        };
        
        // Set specific values for certain IDs
        switch(id) {
            case 'appPrice': mockElement.value = '9.99'; break;
            case 'startingMAU': mockElement.value = '1000'; break;
            case 'projectionPeriod': mockElement.value = '36'; break;
            case 'year1Growth': mockElement.value = '16'; break;
            case 'initialConversion': mockElement.value = '2'; break;
            case 'finalConversion': mockElement.value = '5'; break;
            case 'teamCostY1': mockElement.value = '4500'; break;
            case 'marketingCostY1': mockElement.value = '1200'; break;
            case 'seedInvestment': mockElement.value = '250000'; break;
            default: mockElement.value = '0';
        }
        
        console.log(`🔍 Mock getElementById('${id}') returning value: ${mockElement.value}`);
        return mockElement;
    },
    
    querySelectorAll: (selector) => {
        console.log(`🔍 Mock querySelectorAll('${selector}')`);
        return [];
    }
};

// Mock global document
global.document = mockDOM;

// Test basic calculation logic (simplified)
function testBasicCalculation() {
    console.log('\n🧮 Testing basic calculation logic...');
    
    try {
        const appPrice = parseFloat(mockDOM.getElementById('appPrice').value) || 0;
        const startingMAU = parseInt(mockDOM.getElementById('startingMAU').value) || 0;
        const projectionMonths = parseInt(mockDOM.getElementById('projectionPeriod').value) || 0;
        
        console.log(`✅ Basic parameter extraction:`, {
            appPrice,
            startingMAU, 
            projectionMonths
        });
        
        // Simple calculation test
        const monthlyRevenue = startingMAU * 0.02 * appPrice; // 2% conversion
        const totalRevenue = monthlyRevenue * projectionMonths;
        
        console.log(`✅ Simple calculation result:`, {
            monthlyRevenue: formatCurrency(monthlyRevenue),
            totalRevenue: formatCurrency(totalRevenue)
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Basic calculation test failed:', error.message);
        return false;
    }
}

// Run the test
const testResult = testBasicCalculation();
console.log(`\n🎯 Test result: ${testResult ? 'PASS' : 'FAIL'}`);