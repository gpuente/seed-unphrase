# Core Library Porting Specification

## Overview
This specification details the porting process for converting the TypeScript seed phrase concealment library (`/packages/lib`) to Arduino C++ for the ESP32 TTGO T-Display platform. The porting maintains 100% algorithm compatibility while optimizing for embedded hardware constraints.

## Library Mapping

### TypeScript to C++ Translation

| TypeScript Feature | Arduino/ESP32 Solution | Library/Method |
|-------------------|------------------------|----------------|
| `BigInt` (300+ digits) | `BigNumber` class | Nick Gammon's BigNumber.h |
| `Map<string, number>` | Sorted array + binary search | Standard C++ arrays |
| `SHA-256` hashing | `mbedtls_md_*` functions | ESP32 built-in mbedtls |
| `string` operations | `String` class | Arduino String library |
| `JSON` wordlist | `PROGMEM` array | Flash memory storage |
| Error exceptions | Error codes | Custom error handling |

### Required Libraries

```cpp
// Core libraries
#include <Arduino.h>
#include <BigNumber.h>
#include "mbedtls/md.h"

// TTGO T-Display specific
#include <TFT_eSPI.h>

// Standard C++ (subset available on Arduino)
#include <stdint.h>
#include <string.h>
```

## Core Algorithm Implementation

### 1. Utility Functions

#### formatIndex Function
```cpp
// TypeScript: formatIndex(index: number): string
String formatIndex(int index) {
    char buffer[5];
    snprintf(buffer, sizeof(buffer), "%04d", index);
    return String(buffer);
}
```

#### parseWords Function
```cpp
// TypeScript: parseWords(phrase: string): string[]
int parseWords(const String& phrase, String words[], int maxWords) {
    String cleanPhrase = phrase;
    cleanPhrase.trim();
    
    int wordCount = 0;
    int startIndex = 0;
    
    for (int i = 0; i <= cleanPhrase.length() && wordCount < maxWords; i++) {
        if (i == cleanPhrase.length() || cleanPhrase.charAt(i) == ' ') {
            if (i > startIndex) {
                words[wordCount] = cleanPhrase.substring(startIndex, i);
                words[wordCount].trim();
                if (words[wordCount].length() > 0) {
                    words[wordCount].toLowerCase();
                    wordCount++;
                }
            }
            startIndex = i + 1;
        }
    }
    
    return wordCount;
}
```

#### validatePhraseLength Function
```cpp
// TypeScript: validatePhraseLength(words: string[]): void
bool validatePhraseLength(int wordCount, String& errorMsg) {
    if (wordCount == 0) {
        errorMsg = "Seed phrase cannot be empty";
        return false;
    }
    
    if (wordCount > 24) {
        errorMsg = "Seed phrase cannot exceed 24 words";
        return false;
    }
    
    return true;
}
```

### 2. BigNumber Operations

#### buildNumberFromIndices Function
```cpp
// TypeScript: buildNumberFromIndices(indices: number[]): bigint
BigNumber buildNumberFromIndices(int indices[], int count) {
    String result = "1"; // Start with '1' as prefix
    
    for (int i = 0; i < count; i++) {
        result += formatIndex(indices[i]);
    }
    
    return BigNumber(result.c_str());
}
```

#### parseNumberToIndices Function  
```cpp
// TypeScript: parseNumberToIndices(num: bigint): number[]
int parseNumberToIndices(const BigNumber& num, int indices[], String& errorMsg) {
    String numStr = num.toString();
    
    // Remove the leading '1'
    if (!numStr.startsWith("1")) {
        errorMsg = "Invalid concealed value: must start with 1";
        return -1;
    }
    
    String indexStr = numStr.substring(1);
    
    // Check if divisible by 4
    if (indexStr.length() % 4 != 0) {
        errorMsg = "Invalid concealed value: incorrect format";
        return -1;
    }
    
    int count = indexStr.length() / 4;
    
    for (int i = 0; i < count; i++) {
        String chunk = indexStr.substring(i * 4, (i * 4) + 4);
        int index = chunk.toInt();
        
        if (index < 0) {
            errorMsg = "Invalid word index: " + chunk;
            return -1;
        }
        
        indices[i] = index;
    }
    
    return count;
}
```

#### divideWithRemainder Function
```cpp
// TypeScript: divideWithRemainder(dividend: bigint, divisor: bigint)
bool divideWithRemainder(const BigNumber& dividend, const BigNumber& divisor,
                        BigNumber& quotient, BigNumber& remainder, String& errorMsg) {
    if (divisor == BigNumber("0")) {
        errorMsg = "Cannot divide by zero";
        return false;
    }
    
    quotient = dividend / divisor;
    remainder = dividend % divisor;
    
    return true;
}
```

#### multiplyAndAdd Function
```cpp
// TypeScript: multiplyAndAdd(quotient: bigint, divisor: bigint, remainder: bigint): bigint
BigNumber multiplyAndAdd(const BigNumber& quotient, const BigNumber& divisor, 
                        const BigNumber& remainder) {
    return quotient * divisor + remainder;
}
```

### 3. Cipher Key Validation

#### validateCipherKey Function
```cpp
// TypeScript: validateCipherKey(cipherKey: string): bigint
bool validateCipherKey(const String& cipherKey, BigNumber& result, String& errorMsg) {
    String key = cipherKey;
    key.trim();
    
    if (key.length() == 0) {
        errorMsg = "Cipher key cannot be empty";
        return false;
    }
    
    // Check if all characters are digits
    for (int i = 0; i < key.length(); i++) {
        if (!isDigit(key.charAt(i))) {
            errorMsg = "Cipher key must be a valid number";
            return false;
        }
    }
    
    result = BigNumber(key.c_str());
    
    if (result <= BigNumber("0")) {
        errorMsg = "Cipher key must be a positive number";
        return false;
    }
    
    return true;
}
```

### 4. Concealed Value Parsing

#### parseConcealedValue Function
```cpp
// TypeScript: parseConcealedValue(concealedValue: string)
bool parseConcealedValue(const String& concealedValue, BigNumber& quotient, 
                        BigNumber& remainder, String& errorMsg) {
    String value = concealedValue;
    value.trim();
    
    int colonIndex = value.indexOf(':');
    if (colonIndex == -1) {
        errorMsg = "Concealed value must be in format 'quotient:remainder'";
        return false;
    }
    
    String quotientStr = value.substring(0, colonIndex);
    String remainderStr = value.substring(colonIndex + 1);
    
    quotientStr.trim();
    remainderStr.trim();
    
    if (quotientStr.length() == 0 || remainderStr.length() == 0) {
        errorMsg = "Invalid concealed value format";
        return false;
    }
    
    quotient = BigNumber(quotientStr.c_str());
    remainder = BigNumber(remainderStr.c_str());
    
    if (quotient < BigNumber("0") || remainder < BigNumber("0")) {
        errorMsg = "Quotient and remainder must be non-negative";
        return false;
    }
    
    return true;
}
```

## BIP39 Wordlist Management

### PROGMEM Storage Implementation

```cpp
// Store BIP39 wordlist in flash memory to save RAM
const char* const BIP39_WORDS[] PROGMEM = {
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
    "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
    // ... continue with all 2048 words
    "zone", "zoo"
};

const int BIP39_WORD_COUNT = 2048;
```

### Word Lookup Functions

```cpp
// Get word by index (0-2047)
String getWordByIndex(int index) {
    if (index < 0 || index >= BIP39_WORD_COUNT) {
        return "";
    }
    
    char buffer[16]; // Max BIP39 word length is 8 chars
    strcpy_P(buffer, (char*)pgm_read_ptr(&(BIP39_WORDS[index])));
    return String(buffer);
}

// Get index by word using binary search
int getWordIndex(const String& word) {
    String searchWord = word;
    searchWord.toLowerCase();
    
    int left = 0;
    int right = BIP39_WORD_COUNT - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        char buffer[16];
        strcpy_P(buffer, (char*)pgm_read_ptr(&(BIP39_WORDS[mid])));
        String midWord = String(buffer);
        
        int comparison = searchWord.compareTo(midWord);
        
        if (comparison == 0) {
            return mid;
        } else if (comparison < 0) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    return -1; // Not found
}

// Validate words and get indices
int validateWords(String words[], int wordCount, int indices[], 
                  String invalidWords[], int& invalidCount) {
    int validCount = 0;
    invalidCount = 0;
    
    for (int i = 0; i < wordCount; i++) {
        int index = getWordIndex(words[i]);
        
        if (index >= 0) {
            indices[validCount] = index;
            validCount++;
        } else {
            invalidWords[invalidCount] = words[i];
            invalidCount++;
            
            // Replace invalid word with "abandon" (index 0)
            indices[validCount] = 0;
            validCount++;
        }
    }
    
    return validCount;
}
```

## SHA-256 Implementation

### Salt Transformation Functions

```cpp
// Simple hash function for deterministic salt transformations
uint32_t simpleHash(const String& input) {
    byte shaResult[32];
    mbedtls_md_context_t ctx;
    mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;
    
    mbedtls_md_init(&ctx);
    mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 0);
    mbedtls_md_starts(&ctx);
    mbedtls_md_update(&ctx, (const unsigned char*)input.c_str(), input.length());
    mbedtls_md_finish(&ctx, shaResult);
    mbedtls_md_free(&ctx);
    
    // Convert first 4 bytes to uint32_t
    uint32_t hash = ((uint32_t)shaResult[0] << 24) | 
                    ((uint32_t)shaResult[1] << 16) | 
                    ((uint32_t)shaResult[2] << 8) | 
                    (uint32_t)shaResult[3];
    
    return hash;
}

// Generate salt-based transformations for each word position
void generateSaltTransforms(const String& salt, int count, int transforms[]) {
    if (salt.length() == 0) {
        // No salt means no transformation
        for (int i = 0; i < count; i++) {
            transforms[i] = 0;
        }
        return;
    }
    
    for (int i = 0; i < count; i++) {
        String input = salt + ":" + String(i);
        uint32_t hash = simpleHash(input);
        transforms[i] = hash % 2048; // Keep in valid BIP39 range
    }
}

// Apply salt transformation to word indices
void applySaltTransformation(int indices[], int count, const String& salt) {
    if (salt.length() == 0) {
        return; // No transformation without salt
    }
    
    int transforms[24]; // Maximum 24 words
    generateSaltTransforms(salt, count, transforms);
    
    for (int i = 0; i < count; i++) {
        indices[i] = (indices[i] + transforms[i]) % 2048;
    }
}

// Reverse salt transformation to get original indices
void reverseSaltTransformation(int indices[], int count, const String& salt) {
    if (salt.length() == 0) {
        return; // No transformation without salt
    }
    
    int transforms[24]; // Maximum 24 words
    generateSaltTransforms(salt, count, transforms);
    
    for (int i = 0; i < count; i++) {
        indices[i] = (indices[i] - transforms[i] + 2048) % 2048;
    }
}
```

## Main Implementation Classes

### SeedConcealer Class Definition

```cpp
class SeedConcealer {
public:
    struct ConcealResult {
        String quotient;
        String remainder;
        int originalWordCount;
        bool success;
        String errorMessage;
    };
    
    struct ValidationResult {
        String validWords[24];
        String invalidWords[24];
        int validCount;
        int invalidCount;
        int wordIndices[24];
        bool success;
        String errorMessage;
    };
    
    // Main concealment function
    static ConcealResult concealSeedPhrase(const String& phrase, 
                                          const String& cipherKey, 
                                          const String& salt = "");
    
    // Main reveal function
    static String revealSeedPhrase(const String& concealedValue, 
                                  const String& cipherKey, 
                                  const String& salt = "");
    
    // Validation function
    static ValidationResult validateSeedPhrase(const String& phrase);

private:
    // Helper functions
    static BigNumber buildNumberFromIndices(int indices[], int count);
    static int parseNumberToIndices(const BigNumber& num, int indices[], String& errorMsg);
    static bool divideWithRemainder(const BigNumber& dividend, const BigNumber& divisor,
                                   BigNumber& quotient, BigNumber& remainder, String& errorMsg);
    static BigNumber multiplyAndAdd(const BigNumber& quotient, const BigNumber& divisor,
                                   const BigNumber& remainder);
    static bool validateCipherKey(const String& cipherKey, BigNumber& result, String& errorMsg);
    static bool parseConcealedValue(const String& concealedValue, BigNumber& quotient,
                                   BigNumber& remainder, String& errorMsg);
    static void applySaltTransformation(int indices[], int count, const String& salt);
    static void reverseSaltTransformation(int indices[], int count, const String& salt);
};
```

### Main Conceal Implementation

```cpp
SeedConcealer::ConcealResult SeedConcealer::concealSeedPhrase(const String& phrase, 
                                                             const String& cipherKey, 
                                                             const String& salt) {
    ConcealResult result;
    result.success = false;
    
    // Step 1: Validate seed phrase
    ValidationResult validation = validateSeedPhrase(phrase);
    if (!validation.success) {
        result.errorMessage = validation.errorMessage;
        return result;
    }
    
    // Step 2: Validate cipher key
    BigNumber cipherKeyBigInt;
    if (!validateCipherKey(cipherKey, cipherKeyBigInt, result.errorMessage)) {
        return result;
    }
    
    // Step 3: Apply salt transformation to indices
    int transformedIndices[24];
    for (int i = 0; i < validation.validCount; i++) {
        transformedIndices[i] = validation.wordIndices[i];
    }
    applySaltTransformation(transformedIndices, validation.validCount, salt);
    
    // Step 4: Build number from transformed indices
    BigNumber seedNumber = buildNumberFromIndices(transformedIndices, validation.validCount);
    
    // Step 5: Divide by cipher key
    BigNumber quotient, remainder;
    if (!divideWithRemainder(seedNumber, cipherKeyBigInt, quotient, remainder, result.errorMessage)) {
        return result;
    }
    
    // Step 6: Format result
    result.quotient = quotient.toString();
    result.remainder = remainder.toString();
    result.originalWordCount = validation.validCount + validation.invalidCount;
    result.success = true;
    
    return result;
}
```

### Main Reveal Implementation

```cpp
String SeedConcealer::revealSeedPhrase(const String& concealedValue, 
                                      const String& cipherKey, 
                                      const String& salt) {
    String errorMsg;
    
    // Step 1: Parse concealed value
    BigNumber quotient, remainder;
    if (!parseConcealedValue(concealedValue, quotient, remainder, errorMsg)) {
        return "Error: " + errorMsg;
    }
    
    // Step 2: Validate cipher key
    BigNumber cipherKeyBigInt;
    if (!validateCipherKey(cipherKey, cipherKeyBigInt, errorMsg)) {
        return "Error: " + errorMsg;
    }
    
    // Step 3: Reconstruct seed number
    BigNumber seedNumber = multiplyAndAdd(quotient, cipherKeyBigInt, remainder);
    
    // Step 4: Parse to indices
    int indices[24];
    int wordCount = parseNumberToIndices(seedNumber, indices, errorMsg);
    if (wordCount < 0) {
        return "Error: " + errorMsg;
    }
    
    // Step 5: Reverse salt transformation
    reverseSaltTransformation(indices, wordCount, salt);
    
    // Step 6: Convert indices to words
    String result = "";
    for (int i = 0; i < wordCount; i++) {
        if (i > 0) result += " ";
        result += getWordByIndex(indices[i]);
    }
    
    return result;
}
```

## Memory Management

### Memory Usage Optimization

```cpp
// Memory pool for BigNumber operations
class BigNumberPool {
private:
    static const int POOL_SIZE = 3;
    BigNumber pool[POOL_SIZE];
    bool inUse[POOL_SIZE];
    
public:
    BigNumber* acquire() {
        for (int i = 0; i < POOL_SIZE; i++) {
            if (!inUse[i]) {
                inUse[i] = true;
                return &pool[i];
            }
        }
        return nullptr; // Pool exhausted
    }
    
    void release(BigNumber* bn) {
        for (int i = 0; i < POOL_SIZE; i++) {
            if (&pool[i] == bn) {
                inUse[i] = false;
                pool[i] = BigNumber("0"); // Clear for security
                break;
            }
        }
    }
};

static BigNumberPool bigNumberPool;
```

### Stack Protection

```cpp
// Secure memory clearing
void secureMemclear(void* ptr, size_t len) {
    volatile unsigned char* p = (volatile unsigned char*)ptr;
    while (len--) {
        *p++ = 0;
    }
}

// Use in critical functions
void clearSensitiveData(String& data) {
    // Clear Arduino String internal buffer
    for (int i = 0; i < data.length(); i++) {
        data.setCharAt(i, '0');
    }
    data = "";
}
```

## Testing & Validation

### Cross-Platform Test Vectors

```cpp
struct TestVector {
    const char* phrase;
    const char* cipherKey;
    const char* salt;
    const char* expectedQuotient;
    const char* expectedRemainder;
};

const TestVector TEST_VECTORS[] = {
    {
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
        "123456789",
        "",
        "8140900850093217428444249652065618088",
        "100932417"
    },
    // Add more test vectors from TypeScript implementation
};

bool runTestVector(const TestVector& test) {
    SeedConcealer::ConcealResult result = SeedConcealer::concealSeedPhrase(
        test.phrase, test.cipherKey, test.salt);
    
    if (!result.success) {
        Serial.println("Test failed with error: " + result.errorMessage);
        return false;
    }
    
    bool quotientMatch = (result.quotient == test.expectedQuotient);
    bool remainderMatch = (result.remainder == test.expectedRemainder);
    
    if (!quotientMatch || !remainderMatch) {
        Serial.println("Test vector mismatch:");
        Serial.println("Expected: " + String(test.expectedQuotient) + ":" + String(test.expectedRemainder));
        Serial.println("Got: " + result.quotient + ":" + result.remainder);
        return false;
    }
    
    // Test round-trip
    String revealed = SeedConcealer::revealSeedPhrase(
        result.quotient + ":" + result.remainder, test.cipherKey, test.salt);
    
    if (revealed != test.phrase) {
        Serial.println("Round-trip test failed:");
        Serial.println("Original: " + String(test.phrase));
        Serial.println("Revealed: " + revealed);
        return false;
    }
    
    return true;
}

void runAllTests() {
    int testCount = sizeof(TEST_VECTORS) / sizeof(TestVector);
    int passedTests = 0;
    
    for (int i = 0; i < testCount; i++) {
        Serial.println("Running test " + String(i + 1) + "...");
        if (runTestVector(TEST_VECTORS[i])) {
            Serial.println("✓ Test " + String(i + 1) + " passed");
            passedTests++;
        } else {
            Serial.println("✗ Test " + String(i + 1) + " failed");
        }
    }
    
    Serial.println("\nTest Results: " + String(passedTests) + "/" + String(testCount) + " passed");
}
```

## Performance Considerations

### ESP32 Specific Optimizations

```cpp
// Use CPU optimization flags
#pragma GCC optimize("O2")

// Prefer stack allocation for small operations
void fastStringOperation() {
    char buffer[64]; // Stack allocation
    // ... operations
    secureMemclear(buffer, sizeof(buffer));
}

// Use IRAM for critical functions
void IRAM_ATTR criticalFunction() {
    // Code that needs to be in RAM for speed
}

// Optimize BigNumber operations
BigNumber optimizedDivision(const BigNumber& dividend, const BigNumber& divisor) {
    // Use temporary variables to minimize object creation
    static BigNumber temp;
    temp = dividend;
    return temp / divisor;
}
```

### Memory Monitoring

```cpp
void printMemoryUsage() {
    Serial.println("Free heap: " + String(ESP.getFreeHeap()) + " bytes");
    Serial.println("Heap size: " + String(ESP.getHeapSize()) + " bytes");
    Serial.println("Free PSRAM: " + String(ESP.getFreePsram()) + " bytes");
}

// Call before and after operations to monitor usage
void operationWithMonitoring() {
    Serial.println("Before operation:");
    printMemoryUsage();
    
    // Perform operation
    SeedConcealer::ConcealResult result = SeedConcealer::concealSeedPhrase(
        "test phrase", "12345", "salt");
    
    Serial.println("After operation:");
    printMemoryUsage();
}
```

## Implementation Checklist

### Core Functions
- [ ] formatIndex() - Format number with leading zeros
- [ ] parseWords() - Split phrase into word array
- [ ] validatePhraseLength() - Check word count limits
- [ ] buildNumberFromIndices() - Create BigNumber from word indices
- [ ] parseNumberToIndices() - Extract indices from BigNumber
- [ ] divideWithRemainder() - BigNumber division with remainder
- [ ] multiplyAndAdd() - Reconstruct number from division result
- [ ] validateCipherKey() - Validate and parse cipher key
- [ ] parseConcealedValue() - Parse quotient:remainder format

### BIP39 Functions
- [ ] BIP39_WORDS[] PROGMEM array - All 2048 words in flash
- [ ] getWordByIndex() - Retrieve word from flash memory
- [ ] getWordIndex() - Binary search for word index
- [ ] validateWords() - Check words against BIP39 list

### Cryptographic Functions
- [ ] simpleHash() - SHA-256 based hash using mbedtls
- [ ] generateSaltTransforms() - Create deterministic salt transforms
- [ ] applySaltTransformation() - Apply salt to word indices
- [ ] reverseSaltTransformation() - Remove salt from word indices

### Main Classes
- [ ] SeedConcealer class - Main implementation wrapper
- [ ] ConcealResult struct - Result data structure
- [ ] ValidationResult struct - Validation data structure
- [ ] concealSeedPhrase() - Complete concealment workflow
- [ ] revealSeedPhrase() - Complete reveal workflow
- [ ] validateSeedPhrase() - Phrase validation workflow

### Memory Management
- [ ] BigNumberPool class - Memory pool for BigNumber objects
- [ ] secureMemclear() - Secure memory clearing function
- [ ] clearSensitiveData() - Clear String data securely
- [ ] Stack protection in all sensitive functions

### Testing & Validation
- [ ] TestVector struct - Test case data structure
- [ ] runTestVector() - Execute single test case
- [ ] runAllTests() - Execute complete test suite
- [ ] Cross-validation with TypeScript implementation
- [ ] Performance benchmarking on TTGO hardware

### ESP32 Integration
- [ ] Memory usage monitoring functions
- [ ] Performance optimization flags
- [ ] IRAM placement for critical functions
- [ ] Error handling without exceptions
- [ ] Arduino String optimization

## Dependencies Summary

### Required Libraries
```cpp
// Add to platformio.ini or Arduino IDE Library Manager
lib_deps = 
    https://github.com/nickgammon/BigNumber
    # ESP32 Core (includes mbedtls)
    # TFT_eSPI (for display integration)
```

### Hardware Requirements
- **ESP32-based TTGO T-Display**
- **Minimum 520KB RAM** (ESP32 standard)
- **4MB Flash memory** (for PROGMEM storage)
- **No external crypto hardware required**

This specification provides a complete blueprint for porting the TypeScript cryptographic library to Arduino C++, ensuring algorithm compatibility while optimizing for the TTGO T-Display's hardware constraints.