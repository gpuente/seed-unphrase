# TTGO Display Seed Concealer - Product Requirements Document

## 1. Product Overview

### 1.1 Objective
Create a completely air-gapped hardware device for concealing and revealing cryptocurrency seed phrases using the existing seed-unphrase algorithm. The device operates entirely offline with no wireless connectivity, providing maximum security through physical isolation.

### 1.2 Target Hardware
- **TTGO T-Display ESP32** - ESP32-based development board with integrated TFT display
- **Display**: 135x240 pixel TFT IPS screen (1.14-inch, ST7789 driver)
- **Input**: 2 physical buttons only
- **Storage**: Volatile memory only - no permanent storage of sensitive data
- **Connectivity**: Completely disabled (no WiFi, no Bluetooth)

### 1.3 Core Value Proposition
- **Ultimate Security**: Air-gapped operation prevents any network-based attacks
- **Hardware Wallet UX**: Similar navigation experience to Ledger devices
- **Portable**: Self-contained device for secure seed phrase operations
- **Educational**: Demonstrates secure hardware implementation of cryptographic operations

## 2. Security Architecture

### 2.1 Air-Gap Security
- **No Network Interfaces**: WiFi and Bluetooth permanently disabled in firmware
- **No Permanent Storage**: All data stored only in volatile RAM
- **Power-Off Clear**: Complete data erasure when device is powered off
- **Physical Only**: Data input/output through display and manual transcription only

### 2.2 Memory Management
- **Volatile Only**: Seed phrases, cipher keys, and salts stored only in RAM
- **Immediate Clear**: Sensitive data cleared after each operation
- **No Swap/Cache**: No data persisted to any non-volatile storage
- **Stack Protection**: Sensitive data on stack cleared after use

### 2.3 Attack Surface Minimization
- **No USB Data**: Device receives power only via USB (no data communication)
- **No Side Channels**: Minimal electromagnetic/power analysis attack surface
- **Physical Security**: Device must be physically possessed to use

## 3. User Interface Design

### 3.1 Two-Button Navigation System
Exactly matching Ledger hardware wallet UX:

**Button Layout:**
- **Button 1 (LEFT)**: Navigate/Previous/Back
- **Button 2 (RIGHT)**: Navigate/Next/Forward
- **Button 1 + Button 2 (SIMULTANEOUS)**: Confirm/Select

**Navigation Patterns:**
- **Single Button 1**: Move left/previous/decrease
- **Single Button 2**: Move right/next/increase  
- **Both buttons click**: Confirm selection/proceed
- **Both buttons long press**: Menu/back/cancel action

### 3.2 Display Management
**135x240 TFT Layout (Portrait Mode):**
```
┌──────────────────────────────────┐
│ 🌱 CONCEAL MODE         [2/5]    │  <- Header: Mode + Progress
├──────────────────────────────────┤
│                                  │
│ Enter Seed Phrase:               │  <- Instruction
│                                  │
│ Word: 2/12                      │  <- Fixed Word Counter
│ > abandon about _                │  <- Current Input + Cursor
│                                  │
│ Character Wheel:                 │  <- Character Selection
│    < [A] >                       │
│                                  │
│ BIP39 Suggestions:               │  <- Word Predictions
│ 1. abandon                       │
│ 2. about                         │
│ 3. ability                       │
│ 4. able                          │
│                                  │
│ [◄] Navigate    [►] Navigate     │  <- Button Guide
│ [◄+►] Confirm Selection          │
└──────────────────────────────────┘
```

### 3.3 Screen Hierarchy
1. **Main Menu**: Conceal / Reveal selection
2. **Word Count Selection**: Choose number of words (1-24) for conceal mode
3. **Input Screens**: Character wheel + word prediction
4. **Parameter Screens**: Cipher key and salt input
5. **Result Screens**: Display concealed/revealed values
6. **Confirmation Screens**: Verify actions before execution

## 4. BIP39 Predictive Text Input System

### 4.1 Character Wheel Navigation
**Wheel Structure:**
- Characters: `A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [SPACE] [DEL]`
- Button 1: Previous character in wheel (wrapping)
- Button 2: Next character in wheel (wrapping)
- Both buttons: Select character and advance cursor

**Character Selection Flow:**
1. Display current character highlighted in wheel
2. Button 1: Move to previous character
3. Button 2: Move to next character  
4. Both buttons: Add selected character to input buffer and advance cursor

### 4.2 Smart Word Prediction Engine
**Dynamic Mode Switching:**
- **Character Input Mode**: Active when >10 BIP39 matches exist
- **Word Selection Mode**: Auto-switch when ≤10 matches remain
- Real-time match counter shows progress toward selection mode
- Efficient prefix matching with instant BIP39 filtering

**Mode Examples:**
```
Character Input Mode (>10 matches):
Current: "a_" (227 matches)
Type more characters...

Smart Cutoff Mode (≤10 matches):
Current: "ab" → 4 matches found
→ SWITCH TO WORD SELECTION ←

Word Selection Mode:
> 1. abandon    3. about
  2. ability    4. above
Navigate: ◄► Select: ◄+►
```

### 4.3 Optimized Word Selection
**Automatic Mode Detection:**
- **Threshold**: When BIP39 matches ≤ 10 words, automatically switch modes
- **Visual Cue**: Clear indication of mode switch with match count
- **Navigation**: Button 1/2 navigate through word list, both buttons select
- **Efficiency**: No need to type remaining characters once in selection mode

**Selection Interface:**
- Highlighted current selection with visual indicator
- Grid layout showing up to 8 words simultaneously on display
- Immediate word completion and advance to next word input
- **Estimated 60-70% reduction** in total button presses

### 4.4 Smart Character Input Cutoff
**Intelligent Threshold System:**
- **Dynamic Cutoff**: Stops character input when ≤10 BIP39 matches remain
- **Match Counter Display**: Shows "ab (4 matches)" to guide user
- **Mode Transition**: Seamless switch from typing to selection
- **Early Exit**: Prevents unnecessary character entry once list is manageable

**Optimization Examples:**
```
"a" → 227 matches → Continue typing
"ab" → 4 matches → SWITCH TO SELECTION
"acc" → 1 match → SWITCH TO SELECTION
"z" → 1 match → SWITCH TO SELECTION (zebra)
```

**User Flow:**
1. User types minimum characters needed
2. System detects threshold reached (≤10 matches)
3. Auto-switches to word selection mode
4. User navigates short list and confirms selection
5. Massive time savings over full word typing

## 5. Core Functionality

### 5.1 Conceal Mode
**Word Count Pre-Selection:**
- **Word Count Menu**: User first selects desired number of words (1-24)
- **Clear Expectations**: Fixed target provides better UX and progress tracking
- **Number Selection**: Navigate through 1, 2, 3... up to 24 with button navigation
- **Visual Selection**: Current number highlighted, confirm with both buttons

**Word Count Selection Screen:**
```
┌──────────────────────────────────┐
│ 🔒 CONCEAL - Select Word Count   │
├──────────────────────────────────┤
│                                  │
│ How many words to conceal?       │
│                                  │
│ ◄     [ 12 ]     ►              │
│                                  │
│ Common: 12, 15, 18, 21, 24      │
│ Custom: Any from 1-24 words      │
│                                  │
│ [◄] -1    [►] +1    [◄+►] Next  │
└──────────────────────────────────┘
```

**Input Flow:**
1. **Select word count** (1-24) from pre-menu
2. Enter seed phrase words one by one (using predictive text system)
3. **Progress tracking**: "Word: 2/12" shows exact progress to target
4. Enter cipher key (numeric input)
5. Optional: Enable salt + enter salt value
6. Display concealed result (quotient:remainder format)
7. User manually transcribes result

**Fixed Length Benefits:**
- **Clear Progress**: Word counter shows "Word: N/X" with exact target
- **Better UX**: Users know exactly how many words to enter
- **Validation**: System enforces reaching the selected word count
- **Navigation**: Can implement "previous word" functionality

### 5.2 Reveal Mode
**Input Flow:**
1. Enter concealed value (quotient:remainder format)
2. Enter cipher key
3. Optional: Enter salt value if used
4. Display revealed seed phrase
5. User manually transcribes result

**Error Handling:**
- Invalid format detection
- Mathematical validation of inputs
- Clear error messages on small display

### 5.3 Data Flow
**Conceal Process:**
```
Seed Phrase → BIP39 Validation → Word-to-Index → Salt Transform → 
BigInt Construction → Division by Cipher → Quotient:Remainder
```

**Reveal Process:**
```
Quotient:Remainder → Multiplication + Addition → Index Extraction → 
Salt Reverse Transform → Index-to-Words → BIP39 Reconstruction
```

## 6. Algorithm Porting Requirements

### 6.1 TypeScript to C/C++ Port
The core cryptographic library at `/packages/lib` must be ported from TypeScript to C/C++ for ESP32 compatibility.

**Critical Functions to Port:**
- **`concealSeedPhrase()`** - Main concealment algorithm with BigInt operations
- **`revealSeedPhrase()`** - Reverse algorithm for seed phrase recovery  
- **`validateWords()`** - BIP39 wordlist validation and invalid word replacement
- **`buildNumberFromIndices()`** - Constructs BigInt from 4-digit padded indices
- **`divideWithRemainder()`** - High-precision division for quotient:remainder pairs
- **`applySaltTransformation()`** - SHA-256 based salt enhancement system

**Porting Challenges:**
- **BigInt Operations**: ESP32 needs custom BigNumber library for 300+ digit precision
- **Memory Management**: Optimize for 520KB RAM constraint with streaming operations
- **Algorithm Compatibility**: Ensure exact mathematical equivalence with TypeScript version
- **BIP39 Integration**: Port 2048-word wordlist with efficient search/validation

**C/C++ Library Requirements:**
- **BigNumber.h** - Arduino-compatible BigInt implementation for 300+ digit precision
- **mbedtls** - ESP32 built-in crypto library for SHA-256 operations  
- **Arduino String/PROGMEM** - Efficient string manipulation and flash storage
- **BIP39 Wordlist** - 2048 words stored in PROGMEM (32KB in flash memory)

**Library Installation & Configuration:**
- **TFT_eSPI v2.0.14**: Requires manual configuration in User_Setup.h for TTGO T-Display
- **Custom Navigation**: Built-in system, no external dependencies
- **ESP32 Arduino Core**: Includes mbedtls crypto library by default
- **Custom BigInt**: May need ESP32-specific optimization for stack/memory limitations

**Cross-Validation Strategy:**
- Test vectors from TypeScript implementation
- Identical input/output verification across platforms
- Edge case testing (1-word phrases, arbitrary lengths, maximum 24-word phrases)
- Salt transformation consistency validation
- Variable-length phrase algorithm compatibility

## 7. Technical Implementation

### 7.1 Hardware Requirements
- **TTGO T-Display**: ESP32 with 520KB RAM, 4MB Flash
- **Display**: ST7789 135x240 TFT IPS (1.14-inch, color display)
- **Buttons**: 2x built-in tactile switches with hardware debouncing
- **Power**: USB-powered (5V input, 3.3V logic)

### 7.2 Software Architecture
**Framework**: Arduino IDE / PlatformIO
**Language**: C++ (Arduino-style)
**Display & Graphics Libraries:**
- **TFT_eSPI v2.0.14** - Core ST7789 driver for TTGO T-Display (max supported version)
- **Custom Navigation System** - Lightweight, purpose-built navigation for 2-button hardware wallet UX

**Pin Configuration for TTGO T-Display:**
```cpp
#define TFT_MOSI 19  // SPI MOSI
#define TFT_SCLK 18  // SPI Clock  
#define TFT_CS   5   // Chip select
#define TFT_DC   16  // Data/Command
#define TFT_RST  23  // Reset pin
#define TFT_BL   4   // Backlight control
```

**Cryptographic Libraries:**
- BigInt implementation (custom or ported)
- SHA-256 implementation (for salt transforms)
- **mbedtls** library (recommended for ESP32 crypto operations)

### 7.3 Memory Layout
```
Program Memory (Flash):
├── Firmware code (~200KB)
├── BIP39 wordlist (32KB)
├── Character wheel data
└── UI strings/prompts

RAM Usage (~100KB total):
├── Display buffer (1KB)
├── Input buffers (2KB)
├── BIP39 operations (5KB)
├── BigInt calculations (10KB)
├── Stack/system (82KB)
```

### 7.4 Performance Considerations
- **BIP39 Search**: Binary search through wordlist (O(log n))
- **BigInt Operations**: Optimized for ESP32 architecture
- **Display Updates**: TFT_eSPI Sprite class for flicker-free updates (~80KB RAM limit)
- **Button Debouncing**: Hardware + software debouncing (50ms minimum)
- **Custom Navigation**: Minimal memory footprint with reusable screen architecture
- **Graphics Memory**: 16-bit color Sprite limited to ~200x200 pixels on ESP32

## 8. Development Roadmap

### 8.1 Phase 1: Foundation (Week 1-2)
**Deliverables:**
- Basic ESP32 + TFT display setup with TFT_eSPI v2.0.14
- Custom NavigationManager class implementation
- Two-button input handling with debouncing
- Home screen implementation (CONCEAL/REVEAL selection)
- Screen base class and interface design
- Context menu system (screen-specific menus)

**Success Criteria:**
- Device boots and displays home screen within 3 seconds
- Custom navigation works with Ledger-style button controls
- TFT display renders properly at 135x240 resolution
- Button response time under 50ms
- Screen transitions and selection highlighting functional
- Context menu system working (except on home screen)

### 8.2 Phase 2: BIP39 Input System (Week 3-4)
**Deliverables:**
- BIP39 wordlist integration
- Word prediction engine
- Quick word selection
- Input validation system

**Success Criteria:**
- Can input seed phrases efficiently
- Word predictions appear in real-time
- BIP39 validation working correctly
- Input optimization reduces button presses by 60%+

### 8.3 Phase 3: Cryptographic Core (Week 5-6)
**Deliverables:**
- Port BigInt operations from lib package
- Implement conceal/reveal algorithms
- Salt transformation system
- Mathematical validation

**Success Criteria:**
- Conceal operations produce correct results
- Reveal operations match web-secure output
- Salt transformations working
- Algorithm matches existing implementation exactly

### 8.4 Phase 4: Integration & Testing (Week 7-8)
**Deliverables:**
- Complete user flow implementation
- Error handling and edge cases
- Performance optimization
- Comprehensive testing

**Success Criteria:**
- Full conceal/reveal workflow functional
- Cross-validation with existing tools
- Acceptable performance (sub-5s operations)
- Robust error handling

### 8.5 Phase 5: Security Hardening (Week 9-10)
**Deliverables:**
- Memory clearing routines
- Stack protection implementation
- Timing attack mitigation
- Final security review

**Success Criteria:**
- No sensitive data persists after operations
- Secure memory management
- Minimal attack surface
- Security documentation complete

## 9. Technical Specifications

### 9.1 Input Specifications
- **Seed Phrase**: 1 to 24 BIP39 words (flexible length, user-determined)
- **Cipher Key**: Positive integer (up to 32 digits)
- **Salt**: Optional text string (up to 64 characters)
- **Concealed Value**: Quotient:Remainder format (unlimited precision)

### 9.2 Performance Targets
- **Boot Time**: < 3 seconds
- **Conceal Operation**: < 10 seconds for 24-word phrase
- **Reveal Operation**: < 5 seconds
- **BIP39 Search**: < 100ms response time
- **Display Updates**: 30+ FPS for smooth navigation

### 9.3 Constraints
- **No Network**: All connectivity disabled in firmware
- **No Storage**: No persistent data storage
- **Manual I/O**: All data input/output via display + manual transcription
- **2-Button Only**: All navigation via two physical buttons
- **Portrait Display**: 135x240 pixels TFT display (better than expected!)

## 10. Risk Assessment

### 10.1 Technical Risks
- **BigInt Performance**: ESP32 may be slow for large number operations
- **Memory Constraints**: Large seed phrases may exceed available RAM
- **Display Limitations**: Complex UI may be difficult on small screen
- **Input Complexity**: 2-button input may be cumbersome for long phrases

### 10.2 Mitigation Strategies
- **Performance**: Use optimized BigInt library, progress indicators
- **Memory**: Careful memory management, streaming operations where possible
- **Display**: Simplified UI, efficient layouts, clear navigation
- **Input**: Predictive text, quick selection, input optimization

## 11. Success Metrics

### 11.1 Functional Requirements
- [ ] Complete conceal/reveal workflow functional
- [ ] Word count pre-selection menu (1-24 words)
- [ ] Variable-length seed phrase support (1-24 words)
- [ ] Results match existing web-secure implementation exactly
- [ ] BIP39 validation and word prediction working
- [ ] Fixed progress tracking with selected word count
- [ ] All sensitive data cleared from memory after operations
- [ ] Device operates completely offline (no network interfaces)

### 11.2 Performance Requirements  
- [ ] Conceal 24-word phrase in under 10 seconds
- [ ] Word prediction responds in under 100ms
- [ ] Input optimization reduces button presses by 50%+ vs. raw character input
- [ ] Device boots in under 3 seconds

### 11.3 Security Requirements
- [ ] No sensitive data persists after power-off
- [ ] No network connectivity possible
- [ ] Memory clearing routines verified
- [ ] Cross-validation with existing implementations passes

## 12. Future Considerations

### 12.1 Hardware Variations
- Support for different ESP32 board variants
- Alternative display sizes/types
- Battery-powered operation
- Hardware random number generator integration

### 12.2 Feature Extensions
- Multiple conceal/reveal operations per session
- Batch processing capabilities
- Export formats (QR codes via display)
- Hardware-based entropy generation

### 12.3 Security Enhancements
- Secure boot implementation
- Physical tamper detection
- Side-channel attack resistance
- Formal security verification

---

**Document Version**: 1.0  
**Last Updated**: September 2024  
**Status**: Draft - Ready for Implementation