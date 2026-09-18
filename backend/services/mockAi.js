/**
 * AI-RailLink Local Mock AI Response Engine
 * Fast, offline-first technical assistant for high-speed railway communication.
 * Supports English, Hindi, Kannada, and Telugu with live simulation context.
 */

const LANGUAGE_ALIASES = {
  en: 'en',
  english: 'en',
  hi: 'hi',
  hindi: 'hi',
  kn: 'kn',
  kannada: 'kn',
  te: 'te',
  telugu: 'te',
};

function normalizeLanguage(lang) {
  if (!lang) return 'en';
  const clean = String(lang).toLowerCase().trim();
  return LANGUAGE_ALIASES[clean] || 'en';
}

/**
 * Dynamic Context Analyzer for Live Simulation Metrics
 */
function analyzeSimulationContext(context, lang = 'en') {
  if (!context || typeof context !== 'object') {
    return getNoSimulationMessage(lang);
  }

  const speed = context.trainSpeed !== undefined ? context.trainSpeed : context.speed;
  const snr = context.snr;
  const doppler = context.doppler;
  const modulation = context.modulation || 'QPSK';
  const pilotSpacing = context.pilotSpacing || 4;
  const ber = context.ber !== undefined ? context.ber : (context.cnnBer !== undefined ? context.cnnBer : context.lsBer);
  const lsBer = context.lsBer;
  const cnnBer = context.cnnBer;
  const nmse = context.nmse;
  const cnnStatus = context.cnnStatus || 'Trained';

  const hasData = speed !== undefined || snr !== undefined || doppler !== undefined || ber !== undefined || nmse !== undefined;

  if (!hasData) {
    return getNoSimulationMessage(lang);
  }

  // Calculate Doppler if speed is provided but doppler is missing
  const effectiveDoppler = doppler !== undefined ? doppler : (speed !== undefined ? Math.round((speed / 3.6) * (5.9e9 / 3e8)) : null);

  // Link quality assessment
  let linkQuality = 'Stable';
  if (ber !== undefined) {
    if (ber > 0.05) linkQuality = 'Severely Degraded';
    else if (ber > 0.01) linkQuality = 'Moderate Risk';
    else linkQuality = 'Excellent / Robust';
  }

  if (lang === 'hi') {
    return `### सिमुलेशन विश्लेषण (AI-RailLink Physical Layer Analysis)

वर्तमान सिमुलेशन पैरामीटर्स का तकनीकी मूल्यांकन:

- **ट्रेन की गति (Train Speed)**: ${speed !== undefined ? `${speed} km/h` : 'अनुपलब्ध'}
- **डॉप्लर आवृत्ति (Doppler Shift)**: ${effectiveDoppler !== undefined ? `${effectiveDoppler} Hz` : 'अनुपलब्ध'}
- **सिग्नल-टू-नॉइज़ अनुपात (SNR)**: ${snr !== undefined ? `${snr} dB` : 'अनुपलब्ध'}
- **मॉड्यूलेशन (Modulation)**: ${modulation} (पायलट स्पेसिंग: ${pilotSpacing})
- **1D CNN मॉडल स्थिति**: ${cnnStatus}
${lsBer !== undefined ? `- **पारंपरिक LS BER**: ${lsBer}` : ''}
${cnnBer !== undefined ? `- **1D CNN अनुमानित BER**: ${cnnBer}` : ''}
${ber !== undefined && lsBer === undefined ? `- **बिट त्रुटि दर (BER)**: ${ber}` : ''}
${nmse !== undefined ? `- **चैनल NMSE**: ${nmse} dB` : ''}

**तकनीकी निष्कर्ष:**
1. **डॉप्लर प्रभाव**: ${speed ? `${speed} km/h` : 'उच्च गति'} पर वाहक आवृत्ति ऑफसेट के कारण इंटर-कैरियर इंटरफेरेंस (ICI) उत्पन्न होता है।
2. **अनुमान प्रदर्शन**: ${lsBer && cnnBer ? `1D CNN ने बिट त्रुटि दर को ${lsBer} से घटाकर ${cnnBer} कर दिया है।` : '1D CNN चैनल एस्टीमेटर पारंपरिक LS की तुलना में शोर को प्रभावी रूप से दबाता है।'}
3. **लिंक स्थिति**: ${linkQuality}। रेल-टू-ग्राउंड वायरलेस लिंक का संचरण सुचारू रूप से संचालित हो रहा है।`;
  }

  if (lang === 'kn') {
    return `### ಸಿಮ್ಯುಲೇಶನ್ ವಿಶ್ಲೇಷಣೆ (AI-RailLink Physical Layer Analysis)

ಪ್ರಸ್ತುತ ಸಿಮ್ಯುಲೇಶನ್ ನಿಯತಾಂಕಗಳ ತಾಂತ್ರಿಕ ಮೌಲ್ಯಮಾಪನ:

- **ರೈಲಿನ ವೇಗ (Train Speed)**: ${speed !== undefined ? `${speed} km/h` : 'ಲಭ್ಯವಿಲ್ಲ'}
- **ಡಾಪ್ಲರ್ ಆವರ್ತನ (Doppler Shift)**: ${effectiveDoppler !== undefined ? `${effectiveDoppler} Hz` : 'ಲಭ್ಯವಿಲ್ಲ'}
- **ಸಿಗ್ನಲ್-ಟು-ಶಬ್ದ ಅನುಪಾತ (SNR)**: ${snr !== undefined ? `${snr} dB` : 'ಲಭ್ಯವಿಲ್ಲ'}
- **ಮಾಡ್ಯುಲೇಶನ್ (Modulation)**: ${modulation} (ಪೈಲಟ್ ಅಂತರ: ${pilotSpacing})
- **1D CNN ಮಾದರಿ ಸ್ಥಿತಿ**: ${cnnStatus}
${lsBer !== undefined ? `- **ಸಾಂಪ್ರದಾಯಿಕ LS BER**: ${lsBer}` : ''}
${cnnBer !== undefined ? `- **1D CNN ಅಂದಾಜು BER**: ${cnnBer}` : ''}
${ber !== undefined && lsBer === undefined ? `- **ಬಿಟ್ ದೋಷ ದರ (BER)**: ${ber}` : ''}
${nmse !== undefined ? `- **ಚಾನಲ್ NMSE**: ${nmse} dB` : ''}

**ತಾಂತ್ರಿಕ ತೀರ್ಮಾನ:**
1. **ಡಾಪ್ಲರ್ ಪರಿಣಾಮ**: ${speed ? `${speed} km/h` : 'ಹೆಚ್ಚಿನ ವೇಗ'} ವೇಗದಲ್ಲಿ ಕ್ಯಾರಿಯರ್ ಆವರ್ತನ ಆಫ್‌ಸೆಟ್‌ನಿಂದಾಗಿ ಇಂಟರ್-ಕ್ಯಾರಿಯರ್ ಹಸ್ತಕ್ಷೇಪ (ICI) ಉಂಟಾಗುತ್ತದೆ.
2. **ಅಂದಾಜು ಕಾರ್ಯಕ್ಷಮತೆ**: ${lsBer && cnnBer ? `1D CNN ಬಿಟ್ ದೋಷ ದರವನ್ನು ${lsBer} ರಿಂದ ${cnnBer} ಕ್ಕೆ ಇಳಿಸಿದೆ.` : '1D CNN ಚಾನಲ್ ಅಂದಾಜಕವು LS ಗಿಂತ ಹೆಚ್ಚು ಶಬ್ದವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.'}
3. **ಲಿಂಕ್ ಸ್ಥಿತಿ**: ${linkQuality}. ಹೆಚ್ಚಿನ ವೇಗದ ರೈಲ್ವೆ ಸಂವಹನ ಲಿಂಕ್ ಸುರಕ್ಷಿತವಾಗಿದೆ.`;
  }

  if (lang === 'te') {
    return `### సిమ్యులేషన్ విశ్లేషణ (AI-RailLink Physical Layer Analysis)

ప్రస్తుత సిమ్యులేషన్ పారామితుల సాంకేతిక విశ్లేషణ:

- **రైలు వేగం (Train Speed)**: ${speed !== undefined ? `${speed} km/h` : 'అందుబాటులో లేదు'}
- **డాప్లర్ ఫ్రీక్వెన్సీ (Doppler Shift)**: ${effectiveDoppler !== undefined ? `${effectiveDoppler} Hz` : 'అందుబాటులో లేదు'}
- **సిగ్నల్-టు-నాయిస్ నిష్పత్తి (SNR)**: ${snr !== undefined ? `${snr} dB` : 'అందుబాటులో లేదు'}
- **మాడ్యులేషన్ (Modulation)**: ${modulation} (పైలట్ స్పేసింగ్: ${pilotSpacing})
- **1D CNN మోడల్ స్థితి**: ${cnnStatus}
${lsBer !== undefined ? `- **సాంప్రదాయ LS BER**: ${lsBer}` : ''}
${cnnBer !== undefined ? `- **1D CNN అంచనా BER**: ${cnnBer}` : ''}
${ber !== undefined && lsBer === undefined ? `- **బిట్ లోపం రేటు (BER)**: ${ber}` : ''}
${nmse !== undefined ? `- **ఛానల్ NMSE**: ${nmse} dB` : ''}

**సాంకేతిక ముగింపు:**
1. **డాప్లర్ ప్రభావం**: ${speed ? `${speed} km/h` : 'గరిష్ట వేగం'} వద్ద క్యారియర్ ఫ్రీక్వెన్సీ ఆఫ్‌సెట్ వల్ల ఇంటర్-క్యారియర్ ఇంటర్‌ఫెరెన్స్ (ICI) ఏర్పడుతుంది.
2. **అంచనా పనితీరు**: ${lsBer && cnnBer ? `1D CNN బిట్ ఎర్రర్ రేటును ${lsBer} నుండి ${cnnBer} కు తగ్గించింది.` : '1D CNN ఛానల్ ఎస్టిమేటర్ LS కంటే నాయిస్‌ను గణనీయంగా తగ్గిస్తుంది.'}
3. **లింక్ స్థితి**: ${linkQuality}. రైలు కమ్యూనికేషన్ సిస్టమ్ స్థిరంగా పనిచేస్తోంది.`;
  }

  // English default
  return `### Simulation Analysis (AI-RailLink Physical Layer Analysis)

Technical evaluation of the current high-speed railway simulation:

- **Train Speed**: ${speed !== undefined ? `${speed} km/h (${(speed / 3.6).toFixed(1)} m/s)` : 'Unavailable'}
- **Doppler Shift ($f_d$)**: ${effectiveDoppler !== undefined ? `${effectiveDoppler} Hz` : 'Unavailable'}
- **Channel SNR**: ${snr !== undefined ? `${snr} dB` : 'Unavailable'}
- **Modulation Scheme**: ${modulation} (Pilot Spacing: ${pilotSpacing} subcarriers)
- **1D CNN Model Status**: ${cnnStatus}
${lsBer !== undefined ? `- **Conventional LS Estimator BER**: ${lsBer}` : ''}
${cnnBer !== undefined ? `- **1D CNN Denoised BER**: ${cnnBer}` : ''}
${ber !== undefined && lsBer === undefined ? `- **Bit Error Rate (BER)**: ${ber}` : ''}
${nmse !== undefined ? `- **Channel NMSE**: ${nmse} dB` : ''}

**Key Engineering Findings:**
1. **Doppler Spread Impact**: At ${speed ? `${speed} km/h` : 'high speed'}, the Doppler shift causes inter-carrier interference (ICI), breaking orthogonality between adjacent subcarriers.
2. **Estimation Accuracy**: ${lsBer && cnnBer ? `The 1D CNN model reduced BER from ${lsBer} (LS) down to ${cnnBer} (CNN), achieving superior channel recovery.` : 'Deep Learning 1D CNN eliminates noise enhancement inherent in Least Squares (LS) estimation.'}
3. **Link Health**: **${linkQuality}**. The high-speed rail wireless link demonstrates robust transmission performance.`;
}

function getNoSimulationMessage(lang) {
  switch (lang) {
    case 'hi':
      return 'वर्तमान में कोई सिमुलेशन परिणाम उपलब्ध नहीं है। कृपया पहले सिमुलेशन चलाएं।';
    case 'kn':
      return 'ಪ್ರಸ್ತುತ ಯಾವುದೇ ಸಿಮ್ಯುಲೇಶನ್ ಫಲಿತಾಂಶ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಸಿಮ್ಯುಲೇಶನ್ ಚಲಾಯಿಸಿ.';
    case 'te':
      return 'ప్రస్తుతం ఎటువంటి సిమ్యులేషన్ ఫలితాలు అందుబాటులో లేవు. దయచేసి మొదట సిమ్యులేషన్ రన్ చేయండి.';
    case 'en':
    default:
      return 'No simulation result is currently available. Run a simulation first.';
  }
}

/**
 * Educational Predefined Responses for High-Speed Railway OFDM & 1D CNN
 */
const TOPIC_RESPONSES = {
  // 1. What is OFDM / Explain OFDM
  ofdm: {
    patterns: [
      /what is ofdm/i,
      /explain ofdm/i,
      /what is orthogonal frequency/i,
      /ofdm kya hai/i,
      /ofdm ಬಗ್ಗೆ/i,
      /ofdm అంటే ఏమిటి/i,
      /^ofdm$/i,
    ],
    responses: {
      en: `### What is OFDM (Orthogonal Frequency Division Multiplexing)?

**OFDM** is a multicarrier modulation technique that splits a wideband high-speed data stream into multiple closely spaced, orthogonal narrowband subcarriers.

**Key Concepts:**
1. **Orthogonality**: Subcarriers are spaced at intervals of $\\Delta f = 1/T_s$, ensuring zero mutual crosstalk even when their spectrums overlap.
2. **Converts Selective Fading**: It transforms a frequency-selective multipath fading channel into multiple parallel flat-fading subchannels.
3. **Cyclic Prefix (CP)**: A copy of the end of each OFDM symbol is prefixed to absorb multipath delay spread and eliminate Inter-Symbol Interference (ISI).
4. **IFFT/FFT Implementation**: Modulation is performed efficiently using Inverse Fast Fourier Transform (IFFT) at the transmitter and FFT at the receiver.`,
      hi: `### OFDM (ऑर्थोगोनल फ्रीक्वेंसी डिवीजन मल्टीप्लेक्सिंग) क्या है?

**OFDM** एक मल्टीकैरियर मॉड्यूलेशन तकनीक है जो उच्च गति वाले डेटा स्ट्रीम को कई निकटवर्ती, ऑर्थोगोनल नैरोबैंड सबकैरियर्स में विभाजित करती है।

**मुख्य विशेषताएं:**
1. **ऑर्थोगोनैलिटी (Orthogonality)**: सबकैरियर्स के बीच की दूरी $\\Delta f = 1/T_s$ होती है, जिससे स्पेक्ट्रम ओवरलैप होने पर भी आपस में कोई क्रॉसस्टॉक नहीं होता।
2. **मल्टीपाथ का समाधान**: यह फ्रीक्वेंसी-सेलेक्टिव फेडिंग को कई समानांतर फ्लैट-फेडिंग सबचैनलों में बदल देता है।
3. **साइक्लिक प्रीफिक्स (CP)**: इंटर-सिंबल इंटरफेरेंस (ISI) को समाप्त करने के लिए सिंबल के अंत में सुरक्षा अंतराल जोड़ा जाता है।
4. **IFFT/FFT प्रोसेसिंग**: ट्रांसमीटर पर IFFT और रिसीवर पर FFT द्वारा तीव्र डिजिटल सिग्नल प्रोसेसिंग की जाती है।`,
      kn: `### OFDM (ಆರ್ಥೋಗೋನಲ್ ಫ್ರೀಕ್ವೆನ್ಸಿ ಡಿವಿಷನ್ ಮಲ್ಟಿಪ್ಲೆಕ್ಸಿಂಗ್) ಎಂದರೇನು?

**OFDM** ಎಂಬುದು ಮಲ್ಟಿಕಾರಿಯರ್ ಮಾಡ್ಯುಲೇಶನ್ ತಂತ್ರಜ್ಞಾನವಾಗಿದ್ದು, ಹೆಚ್ಚಿನ ವೇಗದ ಡೇಟಾ ಸ್ಟ್ರೀಮ್ ಅನ್ನು ಹಲವಾರು ನಿಕಟವಾದ, ಆರ್ಥೋಗೋನಲ್ ಕಿರಿದಾದ ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳಾಗಿ ವಿಭಜಿಸುತ್ತದೆ.

**ಮುಖ್ಯ ಮುಖ್ಯಾಂಶಗಳು:**
1. **ಆರ್ಥೋಗೋನಾಲಿಟಿ**: ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳು $\\Delta f = 1/T_s$ ಅಂತರದಲ್ಲಿರುತ್ತವೆ, ಇದರಿಂದಾಗಿ ಸ್ಪೆಕ್ಟ್ರಮ್ ಅತಿಕ್ರಮಿಸಿದರೂ ಪರಸ್ಪರ ಹಸ್ತಕ್ಷೇಪ ಉಂಟಾಗುವುದಿಲ್ಲ.
2. **ಮಲ್ಟಿಪಾತ್ ಮರೆಯಾಗುವಿಕೆ**: ಆವರ್ತನ-ಆಯ್ದ ಫೇಡಿಂಗ್ ಚಾನಲ್ ಅನ್ನು ಸಮಾನಾಂತರ ಫ್ಲಾಟ್-ಫೇಡಿಂಗ್ ಸಬ್‌ಚಾನಲ್‌ಗಳಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.
3. **ಸೈಕ್ಲಿಕ್ ಪ್ರಿಫಿಕ್ಸ್ (CP)**: ಇಂಟರ್-ಸಿಂಬಲ್ ಹಸ್ತಕ್ಷೇಪ (ISI) ತಪ್ಪಿಸಲು ಚಿಹ್ನೆಯ ಅಂತ್ಯದ ಭಾಗವನ್ನು ಆರಂಭಕ್ಕೆ ಸೇರಿಸಲಾಗುತ್ತದೆ.
4. **IFFT/FFT ಪ್ರಕ್ರಿಯೆ**: ಪ್ರಸರಣದಲ್ಲಿ IFFT ಮತ್ತು ಸ್ವಾಗತದಲ್ಲಿ FFT ಬಳಸಿ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ತ್ವರಿತವಾಗಿ ನಡೆಸಲಾಗುತ್ತದೆ.`,
      te: `### OFDM (ఆర్థోగోనల్ ఫ్రీక్వెన్సీ డివిజన్ మల్టీప్లెక్సింగ్) అంటే ఏమిటి?

**OFDM** అనేది హై-స్పీడ్ డేటా స్ట్రీమ్‌ను బహుళ ఆర్థోగోనల్ నారోబ్యాండ్ సబ్-క్యారియర్‌లుగా విభజించే అధునాతన మల్టీక్యారియర్ మాడ్యులేషన్ టెక్నిక్.

**ముఖ్యమైన అంశాలు:**
1. **ఆర్థోగోనాలిటీ**: సబ్-క్యారియర్‌ల మధ్య అంతరం $\\Delta f = 1/T_s$ ఉండటం వల్ల స్పెక్ట్రమ్ ఓవర్‌లాప్ అయినా క్రాస్‌టాక్ ఉండదు.
2. **మల్టీపాత్ నివారణ**: ఫ్రీక్వెన్సీ-సెలెక్టివ్ ఫేడింగ్‌ను బహుళ సమాంతర ఫ్లాట్-ఫేడింగ్ ఉప-ఛానళ్లుగా మారుస్తుంది.
3. **సైక్లిక్ ప్రిఫిక్స్ (CP)**: ఇంటర్-సింబల్ ఇంటర్‌ఫెరెన్స్ (ISI) ను పూర్తిగా నివారిస్తుంది.
4. **IFFT/FFT అమలు**: ట్రాన్స్‌మిటర్‌లో IFFT మరియు రిసీవర్‌లో FFT ద్వారా సమర్థవంతంగా ప్రాసెస్ చేయబడుతుంది.`,
    },
  },

  // 2. 64-Subcarrier OFDM
  ofdm_64: {
    patterns: [
      /64[- ]subcarrier/i,
      /64 subcarriers/i,
      /64 subcarrier ofdm/i,
      /what is 64/i,
    ],
    responses: {
      en: `### 64-Subcarrier OFDM Architecture

In AI-RailLink, the physical layer is built upon a standard **64-subcarrier OFDM** transceiver designed for high-speed vehicular and railway standards (e.g., IEEE 802.11p / C-V2X).

**Subcarrier Allocation:**
- **48 Data Subcarriers**: Carry modulated payload symbols (QPSK or 16-QAM).
- **4 Pilot Subcarriers**: Located at fixed subcarrier indices ($\pm 7, \pm 21$) for channel tracking and initial LS channel estimation.
- **12 Null / Guard Subcarriers**: Including the DC subcarrier (index 0) and virtual band-edge guards to prevent adjacent channel interference.
- **Cyclic Prefix (CP)**: 16 samples ($N_{cp} = 16$), giving an overall symbol length of 80 samples ($N + N_{cp} = 64 + 16 = 80$).`,
      hi: `### 64-सबकैरियर OFDM आर्किटेक्चर

AI-RailLink में भौतिक परत (Physical Layer) मानक **64-सबकैरियर OFDM** संरचना पर आधारित है, जो हाई-स्पीड रेलवे मानकों (IEEE 802.11p) के अनुकूल है।

**सबकैरियर विभाजन:**
- **48 डेटा सबकैरियर्स**: उपयोगी डेटा (QPSK या 16-QAM) संचारित करते हैं।
- **4 पायलट सबकैरियर्स**: स्थिर अनुक्रम ($\pm 7, \pm 21$) पर स्थित होते हैं जो चैनल की स्थिति का आकलन करने में मदद करते हैं।
- **12 गार्ड व शून्य सबकैरियर्स**: DC सबकैरियर और किनारों पर गार्ड बैंड।
- **साइक्लिक प्रीफिक्स (CP)**: 16 सैंपल्स, जिससे कुल सिंबल लंबाई 80 सैंपल्स ($64 + 16$) हो जाती है।`,
      kn: `### 64-ಸಬ್‌ಕ್ಯಾರಿಯರ್ OFDM ವಿನ್ಯಾಸ

AI-RailLink ವ್ಯವಸ್ಥೆಯು ಹೈ-ಸ್ಪೀಡ್ ರೈಲ್ವೆ ಸಂವಹನಕ್ಕಾಗಿ **64-ಸಬ್‌ಕ್ಯಾರಿಯರ್ OFDM** ಫ್ರೇಮ್‌ವರ್ಕ್ ಅನ್ನು ಬಳಸುತ್ತದೆ.

**ಉಪ-ಕ್ಯಾರಿಯರ್ ಹಂಚಿಕೆ:**
- **48 ಡೇಟಾ ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳು**: QPSK ಅಥವಾ 16-QAM ಡೇಟಾ ಸಂಕೇತಗಳನ್ನು ಸಾಗಿಸುತ್ತವೆ.
- **4 ಪೈಲಟ್ ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳು**: ಚಾನಲ್ ಅಂದಾಜು ಮಾಡಲು ಸ್ಥಿರ ಸೂಚ್ಯಂಕಗಳಲ್ಲಿ ($\\pm 7, \\pm 21$) ಇರಿಸಲಾಗಿದೆ.
- **12 ಗಾರ್ಡ್ / ಶೂನ್ಯ ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳು**: DC ಮತ್ತು ಬ್ಯಾಂಡ್‌ಎಡ್ಜ್ ಶೂನ್ಯಗಳು.
- **ಸೈಕ್ಲಿಕ್ ಪ್ರಿಫಿಕ್ಸ್ (CP)**: 16 ಮಾದರಿಗಳು, ಒಟ್ಟು ಚಿಹ್ನೆಯ ಉದ್ದ 80 ಮಾದರಿಗಳು ($64 + 16 = 80$).`,
      te: `### 64-సబ్-క్యారియర్ OFDM నిర్మాణం

AI-RailLink ఫిజికల్ లేయర్ హై-స్పీడ్ రైల్వే కమ్యూనికేషన్ కోసం **64-సబ్-క్యారియర్ OFDM** వ్యవస్థను ఉపయోగిస్తుంది.

**సబ్-క్యారియర్ విభజన:**
- **48 డేటా సబ్-క్యారియర్‌లు**: QPSK లేదా 16-QAM ద్వారా సమాచారాన్ని మోసుకెళ్తాయి.
- **4 పైలట్ సబ్-క్యారియర్‌లు**: ఛానల్ అంచనా వేయడానికి నిర్దిష్ట స్థానాల్లో ($\\pm 7, \\pm 21$) ఉంటాయి.
- **12 గార్డ్ మరియు DC సబ్-క్యారియర్‌లు**: స్పెక్ట్రల్ లీకేజీని నిరోధిస్తాయి.
- **సైక్ಲಿಕ್ ప్రిఫిక్స్ (CP)**: 16 నమూనాలు, మొత్తం సింబల్ పొడవు 80 నమూనాలు ($64 + 16$).`,
    },
  },

  // 3. Doppler Shift / Explain Doppler
  doppler: {
    patterns: [
      /what is doppler/i,
      /explain doppler/i,
      /doppler shift/i,
      /doppler effect/i,
      /doppler kya hai/i,
      /ಡಾಪ್ಲರ್/i,
      /డాప్లర్/i,
    ],
    responses: {
      en: `### What is Doppler Shift in High-Speed Rail?

**Doppler shift** is the change in observed frequency caused by relative motion between the transmitter (trackside base station) and the receiver (moving train antenna).

**Formula:**
$$f_d = \\frac{v}{c} f_c \\cos(\\theta)$$

Where:
- $v$ is train velocity (e.g., $300\\text{ km/h} = 83.3\\text{ m/s}$)
- $c$ is speed of light ($3 \\times 10^8\\text{ m/s}$)
- $f_c$ is carrier frequency (typically $5.9\\text{ GHz}$ for C-V2X / Rail)
- $\\theta$ is angle of arrival relative to train motion

**Consequences on OFDM:**
1. **Destroys Orthogonality**: High Doppler spread turns flat subchannels into time-selective channels.
2. **Causes ICI (Inter-Carrier Interference)**: Energy from one subcarrier leaks into neighboring subcarriers.
3. **Degrades LS Estimation**: Standard Least Squares estimation exhibits an error floor, which AI-RailLink overcomes using 1D CNN.`,
      hi: `### हाई-स्पीड रेलवे में डॉप्लर शिफ्ट (Doppler Shift) क्या है?

**डॉप्लर शिफ्ट** ट्रेन और ट्रैकसाइड बेस स्टेशन के बीच सापेक्ष गति के कारण प्राप्त सिग्नल की आवृत्ति में होने वाला परिवर्तन है।

**गणितीय सूत्र:**
$$f_d = \\frac{v}{c} f_c \\cos(\\theta)$$

जहाँ:
- $v$ = ट्रेन की गति ($300\\text{ km/h} = 83.3\\text{ m/s}$)
- $c$ = प्रकाश की गति ($3 \\times 10^8\\text{ m/s}$)
- $f_c$ = कैरियर फ्रीक्वेंसी ($5.9\\text{ GHz}$)
- $\\theta$ = सिग्नल आगमन कोण

**OFDM पर प्रभाव:**
1. **ऑर्थोगोनैलिटी की क्षति**: तीव्र डॉप्लर प्रभाव से सबकैरियर्स के बीच ऑर्थोगोनैलिटी नष्ट हो जाती है।
2. **इंटर-कैरियर इंटरफेरेंस (ICI)**: एक सबकैरियर की ऊर्जा पास के सबकैरियर में हस्तक्षेप करती है।
3. **LS चैनल आकलन की विफलता**: पारंपरिक LS अनुमानक में त्रुटि बढ़ जाती है, जिसे AI-RailLink का 1D CNN प्रभावी रूप से ठीक करता है।`,
      kn: `### ಹೈ-ಸ್ಪೀಡ್ ರೈಲ್ವೆಯಲ್ಲಿ ಡಾಪ್ಲರ್ ಶಿಫ್ಟ್ (Doppler Shift) ಎಂದರೇನು?

**ಡಾಪ್ಲರ್ ಶಿಫ್ಟ್** ಎಂದರೆ ಚಲಿಸುವ ರೈಲು ಮತ್ತು ಟ್ರ್ಯಾಕ್‌ಸೈಡ್ ಬೇಸ್ ಸ್ಟೇಷನ್ ನಡುವಿನ ಸಾಪೇಕ್ಷ ಚಲನೆಯಿಂದಾಗಿ ರಿಸೀವರ್ ಗ್ರಹಿಸುವ ಆವರ್ತನದಲ್ಲಿ ಉಂಟಾಗುವ ಬದಲಾವಣೆ.

**ಸೂತ್ರ:**
$$f_d = \\frac{v}{c} f_c \\cos(\\theta)$$

- $v$ = ರೈಲಿನ ವೇಗ ($300\\text{ km/h} = 83.3\\text{ m/s}$)
- $c$ = ಬೆಳಕಿನ ವೇಗ ($3 \\times 10^8\\text{ m/s}$)
- $f_c$ = ಕ್ಯಾರಿಯರ್ ಆವರ್ತನ ($5.9\\text{ GHz}$)

**OFDM ಮೇಲಿನ ಪರಿಣಾಮ:**
1. **ಆರ್ಥೋಗೋನಾಲಿಟಿ ನಾಶ**: ಹೆಚ್ಚಿನ ವೇಗದಲ್ಲಿ ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳ ನಡುವಿನ ಆರ್ಥೋಗೋನಾಲಿಟಿ ಕಳೆದುಹೋಗುತ್ತದೆ.
2. **ಇಂಟರ್-ಕ್ಯಾರಿಯರ್ ಇಂಟರ್‌ಫರೆನ್ಸ್ (ICI)**: ಪಕ್ಕದ ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳಲ್ಲಿ ಸಿಗ್ನಲ್ ಶಕ್ತಿ ಹರಿದು ಅಡಚಣೆ ಉಂಟಾಗುತ್ತದೆ.
3. **AI-RailLink ಪರಿಹಾರ**: ಸಾಂಪ್ರದಾಯಿಕ LS ಅಂದಾಜಿನ ದೋಷಗಳನ್ನು ಸರಿಪಡಿಸಲು 1D CNN ಅನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.`,
      te: `### హై-స్పీడ్ రైల్వేలో డాప్లర్ షిఫ్ట్ (Doppler Shift) అంటే ఏమిటి?

**డాప్లర్ షిఫ్ట్** అనేది కదులుతున్న రైలు మరియు ట్రాక్‌సైడ్ బేస్ స్టేషన్ మధ్య సాపేక్ష చలనం వల్ల స్వీకరించిన సిగ్నల్ ఫ్రీక్వెన్సీలో ఏర్పడే మార్పు.

**గణిత సమీకరణం:**
$$f_d = \\frac{v}{c} f_c \\cos(\\theta)$$

- $v$ = రైలు వేగం ($300\\text{ km/h} = 83.3\\text{ m/s}$)
- $c$ = కాంతి వేగం ($3 \\times 10^8\\text{ m/s}$)
- $f_c$ = క్యారియర్ ఫ్రీక్వెన్సీ ($5.9\\text{ GHz}$)

**OFDM వ్యవస్థపై ప్రభావం:**
1. **ఆర్థోగోనాలిటీ నష్టం**: అధిక వేగం వద్ద సబ్-క్యారియర్‌ల మధ్య సమతుల్యత దెబ్బతింటుంది.
2. **ICI (ఇంటర్-క్యారియర్ ఇంటర్‌ఫెరెన్స్)**: పక్కనున్న సబ్-క్యారియర్‌లపై తీవ్ర ప్రభావం చూపుతుంది.
3. **1D CNN ప్రయోజనం**: సంప్రదాయ LS ఎస్టిమేషన్ కంటే 1D CNN డాప్లర్ నష్టాన్ని సమర్థవంతంగా నివారిస్తుంది.`,
    },
  },

  // 4. Channel Estimation
  channel_estimation: {
    patterns: [
      /what is channel estimation/i,
      /explain channel estimation/i,
      /channel estimation kya hai/i,
      /ಚಾನಲ್ ಅಂದಾಜು/i,
      /ఛానల్ ఎస్టిమేషన్/i,
    ],
    responses: {
      en: `### What is Channel Estimation in Wireless Communications?

**Channel Estimation** is the process of characterizing the complex physical channel response $H[k]$ (attenuation and phase rotation) introduced by multipath fading, Doppler shift, and obstacles.

**Why is it Critical?**
- In high-speed rail, transmitted signals bounce off rails, wires, terrain, and overhead catenary structures.
- Without knowing $H[k]$, the receiver cannot coherently demodulate the received symbols.
- Accurate channel estimation allows **Zero-Forcing (ZF)** or MMSE equalizers to invert the channel and reconstruct original data bits with minimal Bit Error Rate (BER).`,
      hi: `### चैनल आकलन (Channel Estimation) क्या है?

**चैनल आकलन** वह प्रक्रिया है जिसके द्वारा रिसीवर वायरलेस माध्यम में सिग्नल पर पड़ने वाले प्रभाव (आयाम में कमी और फेज में बदलाव $H[k]$) का अनुमान लगाता है।

**यह क्यों आवश्यक है?**
- हाई-स्पीड रेल में सिग्नल पटरियों, ओवरहेड तारों और इलाके से टकराकर बिखरता है।
- बिना $H[k]$ की जानकारी के रिसीवर डेटा सिंबल्स को सही ढंग से डिकोड नहीं कर सकता।
- सटीक चैनल आकलन से ज़ीरो-फोर्सिंग (ZF) इक्वलाइज़र सिग्नल को पुनर्प्राप्त कर न्यूनतम BER प्रदान करता है।`,
      kn: `### ವೈರ್‌ಲೆಸ್ ಸಂವಹನದಲ್ಲಿ ಚಾನಲ್ ಅಂದಾಜು ಎಂದರೇನು?

**ಚಾನಲ್ ಅಂದಾಜು** ಎಂಬುದು ಪ್ರಸಾರವಾದ ಸಿಗ್ನಲ್ ಮೇಲೆ ಭೌತಿಕ ಪರಿಸರವು ಉಂಟುಮಾಡುವ ಪ್ರಭಾವವನ್ನು ($H[k]$) ಅಳೆಯುವ ಪ್ರಕ್ರಿಯೆಯಾಗಿದೆ.

**ಇದು ಏಕೆ ಮುಖ್ಯ?**
- ಹೈ-ಸ್ಪೀಡ್ ರೈಲಿನಲ್ಲಿ ಸಿಗ್ನಲ್‌ಗಳು ಹಳಿಗಳು, ವಿದ್ಯುತ್ ತಂತಿಗಳು ಮತ್ತು ಭೂಪ್ರದೇಶಗಳಿಂದ ಪ್ರತಿಫಲನಗೊಳ್ಳುತ್ತವೆ.
- $H[k]$ ತಿಳಿಯದೆ ರಿಸೀವರ್ ಡೇಟಾವನ್ನು ಸರಿಯಾಗಿ ಪುನರ್ನಿರ್ಮಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.
- ನಿಖರವಾದ ಚಾನಲ್ ಅಂದಾಜು ಜೀರೋ-ಫೋರ್ಸಿಂಗ್ (ZF) ಈಕ್ವಲೈಜರ್ ಮೂಲಕ ಬಿಟ್ ದೋಷ ದರವನ್ನು (BER) ಕಡಿಮೆ ಮಾಡಲು ನೆರವಾಗುತ್ತದೆ.`,
      te: `### వైర్‌లెస్ కమ్యూనికేషన్‌లో ఛానల్ ఎస్టిమేషన్ అంటే ఏమిటి?

**ఛానల్ ఎస్టిమేషన్** అనేది ట్రాన్స్‌మిట్ చేయబడిన సిగ్నల్‌పై భౌతిక వాతావరణం కలిగించే నష్టాన్ని మరియు ఫేజ్ మార్పును ($H[k]$) గణించే ప్రక్రియ.

**దీని ప్రాముఖ్యత:**
- రైలు వేగంగా ప్రయాణిస్తున్నప్పుడు సిగ్నల్ పల్టీలు కొట్టి రిసీవర్‌ను చేరుతుంది.
- $H[k]$ లేకుండా ఒరిజినల్ డేటాను డీకోడ్ చేయడం సాధ్యం కాదు.
- ఖచ్చితమైన ఛానల్ ఎస్టిమేషన్ జీరో-ఫోర్సింగ్ (ZF) ద్వారా కమ్యూనికేషన్ నాణ్యతను కాపాడుతుంది.`,
    },
  },

  // 5. LS Channel Estimation
  ls_estimation: {
    patterns: [
      /what is ls/i,
      /explain ls/i,
      /least squares/i,
      /ls estimation/i,
      /ls channel estimation/i,
    ],
    responses: {
      en: `### Least Squares (LS) Channel Estimation

**LS Channel Estimation** is the baseline classical estimator. It minimizes the squared error between the received pilot observations and the reconstructed channel without prior statistical assumptions.

**Mathematical Formulation:**
$$\\hat{H}_{LS}[k] = \\frac{Y[k]}{X_p[k]} = H[k] + \\frac{W[k]}{X_p[k]}$$

Where:
- $Y[k]$ is the received pilot signal at subcarrier $k$.
- $X_p[k]$ is the known transmitted pilot symbol.
- $W[k]$ is Additive White Gaussian Noise (AWGN).

**Drawbacks in High-Speed Rail:**
- **Noise Enhancement**: Dividing noise $W[k]$ by pilot power amplifies noise, especially at low SNR.
- **Ignores Correlation**: LS does not utilize the frequency or time correlation of adjacent subcarriers.
- AI-RailLink feeds these noisy $\\hat{H}_{LS}$ estimates into a **1D CNN** for deep denoising!`,
      hi: `### लीस्ट स्क्वेयर्स (LS) चैनल आकलन

**LS चैनल आकलन** एक मानक और सरल तकनीक है जो प्राप्त पायलट सिग्नलों और मूल सिग्नलों के बीच वर्ग त्रुटि (Squared Error) को न्यूनतम करती है।

**गणितीय सूत्र:**
$$\\hat{H}_{LS}[k] = \\frac{Y[k]}{X_p[k]} = H[k] + \\frac{W[k]}{X_p[k]}$$

**हाई-स्पीड रेल में कमियां:**
- **शोर में वृद्धि (Noise Enhancement)**: शोर $W[k]$ को पायलट से विभाजित करने पर विशेष रूप से कम SNR पर शोर बढ़ जाता है।
- **कोरिलेशन का अभाव**: यह निकटवर्ती सबकैरियर्स के बीच आवृत्ति सहसंबंध का लाभ नहीं उठाता।
- AI-RailLink इस अशुद्ध LS अनुमान को **1D CNN** में भेजकर शोर-मुक्त सटीक चैनल तैयार करता है।`,
      kn: `### ಲೀಸ್ಟ್ ಸ್ಕ್ವೇರ್ಸ್ (LS) ಚಾನಲ್ ಅಂದಾಜು

**LS ಚಾನಲ್ ಅಂದಾಜು** ಎಂಬುದು ಪೈಲಟ್ ಸಿಗ್ನಲ್‌ಗಳ ಆಧಾರದ ಮೇಲೆ ಚಾನಲ್ ಅನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡುವ ಸಾಂಪ್ರದಾಯಿಕ ವಿಧಾನವಾಗಿದೆ.

**ಗಣಿತ ಸೂತ್ರ:**
$$\\hat{H}_{LS}[k] = \\frac{Y[k]}{X_p[k]} = H[k] + \\frac{W[k]}{X_p[k]}$$

**ನ್ಯೂನತೆಗಳು:**
- **ಶಬ್ದ ವರ್ಧನೆ (Noise Amplification)**: ಕಡಿಮೆ SNR ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಶಬ್ದವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.
- **ಹೊಂದಾಣಿಕೆ ಕೊರತೆ**: ಪಕ್ಕದ ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳ ಪರಸ್ಪರ ಸಂಬಂಧವನ್ನು ಪರಿಗಣಿಸುವುದಿಲ್ಲ.
- AI-RailLink ಈ ದೋಷಪೂರಿತ LS ಫಲಿತಾಂಶವನ್ನು **1D CNN** ಮೂಲಕ ಶುದ್ಧೀಕರಿಸುತ್ತದೆ.`,
      te: `### లీస్ట్ స్క్వేర్స్ (LS) ఛానల్ ఎస్టిమేషన్

**LS ఛానల్ ఎస్టిమేషన్** అనేది పైలట్ సింబల్స్ ద్వారా ఛానల్‌ను అంచనా వేసే ప్రాథమిక విధానం.

**సమీకరణం:**
$$\\hat{H}_{LS}[k] = \\frac{Y[k]}{X_p[k]} = H[k] + \\frac{W[k]}{X_p[k]}$$

**హై-స్పీడ్ రైలులో పరిమితులు:**
- **నాయిస్ పెరగడం**: తక్కువ SNR వద్ద నాయిస్ మరింత పెరుగుతుంది.
- **సబ్‌క్యారియర్ సమన్వయం లేకపోవడం**: పక్కనున్న సబ్‌క్యారియర్ల మధ్య అనుబంధాన్ని ఉపయోగించదు.
- AI-RailLink ఈ LS ఎస్టిమేషన్‌ను **1D CNN** ద్వారా మరింత మెరుగుపరుస్తుంది.`,
    },
  },

  // 6. CNN / 1D CNN / Why CNN?
  cnn: {
    patterns: [
      /what is cnn/i,
      /explain cnn/i,
      /explain 1d cnn/i,
      /1d cnn/i,
      /why use cnn/i,
      /why cnn/i,
      /deep learning/i,
    ],
    responses: {
      en: `### 1D CNN for OFDM Channel Estimation in High-Speed Rail

A **1-Dimensional Convolutional Neural Network (1D CNN)** is a deep learning model engineered to process sequential and spatial subcarrier sequences.

**Why 1D CNN for AI-RailLink?**
1. **Feature Extraction across 64 Subcarriers**: The channel response across 64 subcarriers exhibits strong frequency correlation due to multipath delays. 1D convolutional kernels act as adaptive spatial-frequency filters.
2. **Noise Suppression**: Learned convolutional filters denoise the noisy $\\hat{H}_{LS}$ inputs, outperforming classical Wiener filtering without requiring matrix inversions.
3. **Ultra-Low Latency**: Inference takes $<1\\text{ ms}$ on standard CPUs/GPUs, meeting strict high-speed train coherence time deadlines ($T_c < 250\\,\\mu\\text{s}$).
4. **Architecture**: 3-4 Conv1D layers (filters: 64 $\\to$ 32 $\\to$ 16 $\\to$ 2) with ReLU activation, processing real and imaginary parts ($[64, 2]$).`,
      hi: `### हाई-स्पीड रेल में 1D CNN चैनल आकलन

**1D कनवल्शनल न्यूरल नेटवर्क (1D CNN)** एक डीप लर्निंग मॉडल है जिसे 64-सबकैरियर अनुक्रमों को प्रोसेस करने के लिए विशेष रूप से डिज़ाइन किया गया है।

**AI-RailLink में 1D CNN के लाभ:**
1. **सबकैरियर कोरिलेशन**: 64 सबकैरियर्स के बीच मल्टीपाथ के कारण आपसी संबंध होता है। 1D CNN के फिल्टर्स इस पैटर्न को स्वतः सीख लेते हैं।
2. **शोर दमन (Noise Suppression)**: यह LS एस्टीमेशन के शोर को खत्म कर देता है बिना किसी जटिल मैट्रिक्स इनवर्जन के।
3. **अल्ट्रा-लो लेटेंसी**: इसका इन्फरेंस 1 मिलीसेकंड से भी कम समय लेता है, जो 300-500 किमी/घंटा पर चलने वाली ट्रेनों के लिए आदर्श है।
4. **संरचना**: इनपुट $[64, 2]$ (रियल और इमेजिनरी भाग) $\\to$ Conv1D लेयर्स $\\to$ सटीक चैनल आउटपुट।`,
      kn: `### ಹೈ-ಸ್ಪೀಡ್ ರೈಲ್ವೆಗಾಗಿ 1D CNN ಚಾನಲ್ ಅಂದಾಜು

**1D ಕನ್ವಲ್ಯೂಷನಲ್ ನ್ಯೂರಲ್ ನೆಟ್‌ವರ್ಕ್ (1D CNN)** ಎಂಬುದು 64 ಸಬ್‌ಕ್ಯಾರಿಯರ್ ಚಾನಲ್ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಶುದ್ಧೀಕರಿಸಲು ಬಳಸಲಾಗುವ ಡೀಪ್ ಲರ್ನಿಂಗ್ ಮಾದರಿಯಾಗಿದೆ.

**1D CNN ನ ಪ್ರಮುಖ ಅನುಕೂಲಗಳು:**
1. **ಆವರ್ತನ ಸಂಬಂಧ ಗ್ರಹಿಕೆ**: ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳ ನಡುವಿನ ಪರಸ್ಪರ ಸಂಬಂಧವನ್ನು 1D ಕರ್ನಲ್‌ಗಳು ಸುಲಭವಾಗಿ ಗುರುತಿಸುತ್ತವೆ.
2. **ಶಬ್ದ ನಿವಾರಣೆ**: ಸಾಂಪ್ರದಾಯಿಕ LS ಅಂದಾಜಿನಲ್ಲಿರುವ ನಾಯ್ಸ್ ಅನ್ನು ಪರಿಣಾಮಕಾರಿಯಾಗಿ ತೆಗೆದುಹಾಕುತ್ತದೆ.
3. **ತ್ವರಿತ ಪ್ರತಿಕ್ರಿಯೆ**: 1 ಮಿಲಿಸೆಕೆಂಡ್‌ಗಿಂತ ಕಡಿಮೆ ಅವಧಿಯಲ್ಲಿ ಲೆಕ್ಕಾಚಾರ ಪೂರ್ಣಗೊಳಿಸುತ್ತದೆ.
4. **ರಚನೆ**: Conv1D ಲೇಯರ್‌ಗಳು ರಿಯಲ್ ಮತ್ತು ಇಮ್ಯಾಜಿನರಿ ಭಾಗಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಸಂಸ್ಕರಿಸಿ ನಿಖರವಾದ ಚಾನಲ್ ನೀಡುತ್ತವೆ.`,
      te: `### హై-స్పీడ్ రైలు కోసం 1D CNN ఛానల్ ఎస్టిమేషన్

**1D CNN (కన్వల్యూషనల్ న్యూరల్ నెట్‌వర్క్)** అనేది డీప్ లెర్నింగ్ ఆధారిత మోడల్, ఇది 64 సబ్-క్యారియర్‌ల డేటాను విశ్లేషించి ఛానల్ ఎస్టిమేషన్‌ను ఖచ్చితంగా అందిస్తుంది.

**1D CNN ఎందుకు వాడాలి?**
1. **సబ్‌క్యారియర్ అనుసంధానం**: మల్టీపాత్ ఛానల్ నమూనాలను 1D కన్వల్యూషన్ సమర్థవంతంగా గుర్తిస్తుంది.
2. **నాయిస్ తొలగింపు**: LS పద్ధతిలో వచ్చే ఎర్రర్స్‌ను పూర్తిగా తగ్గిస్తుంది.
3. **వేగవంతమైన పనితీరు**: కేవలం 1 మిల్లీసెకను కంటే తక్కువ సమయంలో అవుట్‌పుట్ ఇస్తుంది.
4. **ఆర్కిటెక్చర్**: Conv1D లేయర్స్ ద్వారా రియల్ మరియు ఇమాజినరీ భాగాలను వేగంగా ప్రాసెస్ చేస్తుంది.`,
    },
  },

  // 7. Rician Fading
  rician: {
    patterns: [
      /what is rician/i,
      /rician fading/i,
      /rician channel/i,
      /explain rician/i,
      /k-factor/i,
    ],
    responses: {
      en: `### Rician Fading in Railway Communications

**Rician Fading** models wireless signal propagation where a strong, dominant **Line-of-Sight (LOS)** path exists alongside multiple scattered multipath components.

**Key Parameter — Rician $K$-Factor:**
$$K = \\frac{\\text{Power in LOS Component}}{\\text{Power in Scattered NLOS Components}}$$

- **High $K$ ($K \\ge 10\\text{ dB}$)**: Signal dominated by direct LOS; link is very stable with minimal fading depth. Typical in open rural rail tracks with elevated trackside masts.
- **Low $K$ ($K \\to 0\\text{ dB}$)**: LOS path is weak; transitions toward Rayleigh fading (common in cuttings or station gantries).`,
      hi: `### रेलवे संचार में राइसियन फेडिंग (Rician Fading)

**राइसियन फेडिंग** उस वायरलेस चैनल का मॉडल है जहाँ ट्रांसमीटर और रिसीवर के बीच एक मजबूत प्रत्यक्ष दृष्टि रेखा (**Line-of-Sight - LOS**) मौजूद होती है।

**राइसियन $K$-फैक्टर:**
$$K = \\frac{\\text{LOS कंपोनेंट की शक्ति}}{\\text{बिखरे हुए NLOS घटकों की शक्ति}}$$

- **उच्च $K$ ($K \\ge 10\\text{ dB}$)**: मजबूत डायरेक्ट सिग्नल, खुला ग्रामीण रेलवे ट्रैक।
- **निम्न $K$**: सिग्नल कमजोर होता है और रेले फेडिंग की ओर बढ़ता है।`,
      kn: `### ರೈಲ್ವೆ ಸಂವಹನದಲ್ಲಿ ರೈಸಿಯನ್ ಫೇಡಿಂಗ್ (Rician Fading)

**ರೈಸಿಯನ್ ಫೇಡಿಂಗ್** ನೇರ ದೃಷ್ಟಿರೇಖೆ (**Line-of-Sight - LOS**) ಇರುವ ವೈರ್‌ಲೆಸ್ ಚಾನಲ್ ಅನ್ನು ವಿವರಿಸುತ್ತದೆ.

**$K$-ಫ್ಯಾಕ್ಟರ್:**
LOS ಘಟಕದ ಶಕ್ತಿ ಮತ್ತು ಚದುರಿದ ಘಟಕಗಳ ಶಕ್ತಿಯ ನಡುವಿನ ಅನುಪಾತವನ್ನು $K$-ಫ್ಯಾಕ್ಟರ್ ಎನ್ನಲಾಗುತ್ತದೆ. ತೆರೆದ ರೈಲ್ವೆ ಮಾರ್ಗಗಳಲ್ಲಿ ಇದು ಉತ್ತಮ ಸಂಪರ್ಕವನ್ನು ಒದಗಿಸುತ್ತದೆ.`,
      te: `### రైల్వే కమ్యూనికేషన్‌లో రైసియన్ ఫేడింగ్ (Rician Fading)

**రైసియన్ ఫేడింగ్** అనేది ట్రాన్స్‌మిటర్ మరియు రిసీవర్ మధ్య నేరుగా కనిపించే మార్గం (**Line-of-Sight - LOS**) ఉన్నప్పుడు ఏర్పడే సిగ్నల్ మోడల్.

ఇది బహిరంగ రైల్వే ట్రాక్‌లలో బలమైన మరియు స్థిరమైన సిగ్నల్‌ను అందిస్తుంది.`,
    },
  },

  // 8. Rayleigh Fading
  rayleigh: {
    patterns: [
      /what is rayleigh/i,
      /rayleigh fading/i,
      /rayleigh channel/i,
      /explain rayleigh/i,
    ],
    responses: {
      en: `### Rayleigh Fading in Railway Channels

**Rayleigh Fading** models propagation in environments with **No Line-of-Sight (NLOS)** between train antennas and base stations.

**Characteristics:**
1. **Severe Signal Drops**: The received envelope is the sum of many independent, identically distributed scattered paths, following a Rayleigh distribution.
2. **Railway Scenarios**: Highly prevalent in railway tunnels, deep rock cuttings, dense railway stations, and urban viaducts.
3. **Multipath Diversity Required**: Requires pilot-assisted channel estimation and deep learning (1D CNN) to mitigate deep nulls across the 64 subcarriers.`,
      hi: `### रेलवे चैनलों में रेले फेडिंग (Rayleigh Fading)

**रेले फेडिंग** उस स्थिति का मॉडल है जहाँ ट्रेन और बेस स्टेशन के बीच कोई सीधा दृष्टि मार्ग (**No Line-of-Sight - NLOS**) नहीं होता।

**विशेषताएं:**
1. **गंभीर सिग्नल गिरावट**: सिग्नल विभिन्न दिशाओं से टकराकर आता है, जिससे सिग्नल की शक्ति में भारी उतार-चढ़ाव होता है।
2. **रेलवे परिदृश्य**: रेलवे सुरंगों, गहरी कटिंगों और बड़े शहरी रेलवे स्टेशनों में अत्यधिक देखा जाता है।
3. **1D CNN की भूमिका**: गहरे सिग्नल ड्रॉप्स से निपटने के लिए 1D CNN प्रभावी सुरक्षा प्रदान करता है।`,
      kn: `### ರೇಲೀ ಫೇಡಿಂಗ್ (Rayleigh Fading)

**ರೇಲೀ ಫೇಡಿಂಗ್** ಯಾವುದೇ ನೇರ ದೃಷ್ಟಿರೇಖೆ ಇಲ್ಲದ (**NLOS**) ಕಠಿಣ ಪರಿಸರಗಳಲ್ಲಿ ಉಂಟಾಗುತ್ತದೆ (ಉದಾಹರಣೆಗೆ ಸುರಂಗಗಳು ಮತ್ತು ದಟ್ಟವಾದ ನಿಲ್ದಾಣಗಳು).

ಇಲ್ಲಿ ಸಿಗ್ನಲ್ ತೀವ್ರವಾಗಿ ಏರಿಳಿತಗೊಳ್ಳುತ್ತದೆ ಮತ್ತು 1D CNN ಮಾದರಿಯು ಇಂತಹ ನಷ್ಟವನ್ನು ಸರಿಪಡಿಸುತ್ತದೆ.`,
      te: `### రేవ్‌లీ ఫేడింగ్ (Rayleigh Fading)

**రేవ్లీ ఫేడింగ్** అనేది రైలు మరియు బేస్ స్టేషన్ మధ్య నేరుగా మార్గం లేనప్పుడు (**NLOS**) ఏర్పడుతుంది.

రైల్వే టన్నెల్స్ మరియు రద్దీగా ఉండే స్టేషన్లలో ఇది ఎక్కువగా కనిపిస్తుంది. 1D CNN దీనిని అధిగమించడానికి సహాయపడుతుంది.`,
    },
  },

  // 9. Multipath Fading
  multipath: {
    patterns: [
      /what is multipath/i,
      /multipath fading/i,
      /explain multipath/i,
      /multipath propagation/i,
    ],
    responses: {
      en: `### Multipath Fading Explained

**Multipath fading** occurs when radio signals travel along multiple physical trajectories from transmitter to receiver due to reflections, diffraction, and scattering.

**Mechanisms in High-Speed Rail:**
- Signals reflect off tracks, ballast, steel overhead catenary masts, sound barriers, and surrounding topography.
- Each path experiences distinct attenuation, delay $\\tau_i$, and phase shift $\\phi_i$.
- When these paths superimpose at the train's antenna, constructive and destructive interference creates **frequency-selective fading**.
- OFDM counters this by dividing the channel into 64 subcarriers where each experiences flat fading.`,
      hi: `### मल्टीपाथ फेडिंग (Multipath Fading) क्या है?

**मल्टीपाथ फेडिंग** तब होती है जब रेडियो सिग्नल पटरियों, ओवरहेड खंभों, इमारतों और जमीन से परावर्तित होकर कई अलग-अलग रास्तों से रिसीवर तक पहुंचते हैं।

**परिणाम:**
- विभिन्न पथों के समय अंतराल (Delay Spread) के कारण सिग्नलों में आपस में हस्तक्षेप होता है।
- इससे फ्रीक्वेंसी-सेलेक्टिव फेडिंग उत्पन्न होती है। OFDM इसे 64 फ्लैट सबकैरियर्स में बांटकर सुरक्षित बनाता है।`,
      kn: `### ಮಲ್ಟಿಪಾತ್ ಫೇಡಿಂಗ್ (Multipath Fading)

ರೇಡಿಯೋ ತರಂಗಗಳು ಹಳಿಗಳು, ವಿದ್ಯುತ್ ಕಂಬಗಳು ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ವಸ್ತುಗಳಿಂದ ಪ್ರತಿಫಲಿಸಿ ಬಹು ಹಾದಿಗಳ ಮೂಲಕ ರಿಸೀವರ್ ತಲುಪುವುದನ್ನು **ಮಲ್ಟಿಪಾತ್ ಫೇಡಿಂಗ್** ಎನ್ನಲಾಗುತ್ತದೆ.

OFDM ತಂತ್ರಜ್ಞಾನವು ಇದನ್ನು ಸಮರ್ಥವಾಗಿ ನಿಭಾಯಿಸುತ್ತದೆ.`,
      te: `### మల్టీపాత్ ఫేడింగ్ (Multipath Fading)

రేడియో సిగ్నల్స్ రైలు పట్టాలు మరియు స్తంభాల నుండి పరావర్తనం చెంది వేర్వేరు మార్గాల్లో రిసీవర్‌కు చేరడాన్ని **మల్టీపాత్ ఫేడింగ్** అంటారు.

OFDM దీనిని సమర్థవంతంగా నియంత్రిస్తుంది.`,
    },
  },

  // 10. Pilot Signal
  pilot: {
    patterns: [
      /what is pilot/i,
      /pilot signal/i,
      /pilot symbols/i,
      /pilot subcarrier/i,
      /explain pilot/i,
    ],
    responses: {
      en: `### Pilot Symbols in OFDM

**Pilot symbols** are predefined, known complex symbols inserted at dedicated subcarrier locations within an OFDM frame.

**Purpose in AI-RailLink:**
1. **Channel Probing**: The receiver knows the exact value $X_p[k]$ transmitted. Comparing the received $Y_p[k]$ gives raw channel estimate $\\hat{H}_{LS}[k] = Y_p[k] / X_p[k]$.
2. **Tracking Doppler Drift**: Continuous pilot insertion tracks rapid phase rotation caused by train motion.
3. **Power Boosting**: Pilots are frequently transmitted at $+2.5\\text{ dB}$ higher power than data subcarriers for superior SNR immunity.`,
      hi: `### OFDM में पायलट सिग्नल्स (Pilot Symbols)

**पायलट सिंबल्स** पूर्व-निर्धारित संदर्भ सिंबल्स होते हैं जिन्हें ट्रांसमीटर द्वारा विशिष्ट सबकैरियर्स पर भेजा जाता है।

**कार्य:**
1. **चैनल की पहचान**: रिसीवर को पहले से पता होता है कि क्या भेजा गया है, जिससे वह चैनल $H[k] = Y/X$ की गणना कर लेता है।
2. **डॉप्लर ट्रैकिंग**: उच्च गति पर होने वाले फेज बदलाव को ट्रैक करता है।
3. **अतिरिक्त पावर**: पायलटों को डेटा से अधिक पावर के साथ भेजा जाता है।`,
      kn: `### ಪೈಲಟ್ ಸಿಗ್ನಲ್‌ಗಳು (Pilot Symbols)

**ಪೈಲಟ್ ಚಿಹ್ನೆಗಳು** ರಿಸೀವರ್‌ಗೆ ಮುಂಚಿತವಾಗಿಯೇ ತಿಳಿದಿರುವ ಸಂಕೇತಗಳಾಗಿವೆ. ಇವುಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಚಾನಲ್ ಸ್ಥಿತಿಯನ್ನು ನಿಖರವಾಗಿ ಅಳೆಯಲಾಗುತ್ತದೆ.`,
      te: `### పైలట్ సిగ్నల్స్ (Pilot Symbols)

**పైలట్ సింబల్స్** అనేవి రిసీవర్‌కు తెలిసిన రిఫరెన్స్ సంకేతాలు. వీటి ద్వారా ఛానల్ స్థితిని సులభంగా లెక్కించవచ్చు.`,
    },
  },

  // 11. SNR
  snr: {
    patterns: [
      /what is snr/i,
      /signal to noise ratio/i,
      /explain snr/i,
    ],
    responses: {
      en: `### Signal-to-Noise Ratio (SNR)

**SNR (Signal-to-Noise Ratio)** quantifies the ratio of desired signal power to background noise power (AWGN), expressed in decibels (dB):

$$\\text{SNR}_{\\text{dB}} = 10 \\log_{10}\\left(\\frac{P_{\\text{signal}}}{P_{\\text{noise}}}\\right)$$

- **Low SNR ($0 - 10\\text{ dB}$)**: Channel estimation is noisy; conventional LS fails with high BER ($> 0.1$). 1D CNN provides dramatic noise reduction.
- **Medium SNR ($10 - 20\\text{ dB}$)**: Standard operating range for high-speed rail wireless systems.
- **High SNR ($> 20\\text{ dB}$)**: High throughput with low BER ($< 10^{-3}$), ideal for train control and CCTV telemetry.`,
      hi: `### सिग्नल-टू-नॉइज़ अनुपात (SNR) क्या है?

**SNR** सिग्नल की शक्ति और बैकग्राउंड शोर की शक्ति के अनुपात को डेसिबल (dB) में व्यक्त करता है:

$$\\text{SNR}_{\\text{dB}} = 10 \\log_{10}\\left(\\frac{P_{\\text{signal}}}{P_{\\text{noise}}}\\right)$$

- **कम SNR (0-10 dB)**: शोर अधिक होता है, जहाँ 1D CNN मॉडल LS की तुलना में बहुत बेहतर काम करता है।
- **मध्यम SNR (10-20 dB)**: सामान्य रेलवे संचार रेंज।
- **उच्च SNR (> 20 dB)**: स्थिर और तीव्र डेटा संचरण।`,
      kn: `### ಸಿಗ್ನಲ್-ಟು-ಶಬ್ದ ಅನುಪಾತ (SNR)

**SNR** ಎಂಬುದು ರೇಡಿಯೋ ಸಿಗ್ನಲ್ ಶಕ್ತಿ ಮತ್ತು ಹಿನ್ನೆಲೆ ಶಬ್ದದ ನಡುವಿನ ಅನುಪಾತವಾಗಿದೆ. ಹೆಚ್ಚಿನ SNR ಎಂದರೆ ಸ್ಪಷ್ಟ ಸಂವಹನ.`,
      te: `### సిగ్నల్-టు-నాయిస్ నిష్పత్తి (SNR)

**SNR** అనేది సిగ్నల్ బలం మరియు బ్యాక్‌గ్రౌండ్ నాయిస్ మధ్య నిష్పత్తిని సూచిస్తుంది. ఎక్కువ SNR ఉంటే కమ్యూనికేషన్ చాలా స్పష్టంగా ఉంటుంది.`,
    },
  },

  // 12. BER
  ber: {
    patterns: [
      /what is ber/i,
      /bit error rate/i,
      /explain ber/i,
    ],
    responses: {
      en: `### Bit Error Rate (BER)

**Bit Error Rate (BER)** is the primary physical layer figure of merit evaluating digital communication link reliability:

$$\\text{BER} = \\frac{\\text{Number of Incorrectly Decoded Bits}}{\\text{Total Number of Transmitted Bits}}$$

**Key Highlights in AI-RailLink:**
- At $300\\text{ km/h}$, severe Doppler-induced ICI causes conventional LS estimation to produce high BER ($> 0.05$).
- The **1D CNN Channel Estimator** reduces BER by **10× to 100×**, bringing it within the reliable operational threshold ($< 10^{-3}$).`,
      hi: `### बिट त्रुटि दर (BER - Bit Error Rate)

**BER** गलत प्राप्त हुए बिट्स और कुल भेजे गए बिट्स का अनुपात है:

$$\\text{BER} = \\frac{\\text{गलत बिट्स की संख्या}}{\\text{कुल प्रेषित बिट्स}}$$

AI-RailLink में 1D CNN मॉडल डॉप्लर प्रभाव को दूर करके BER को 10 से 100 गुना तक कम कर देता है।`,
      kn: `### ಬಿಟ್ ದೋಷ ದರ (BER)

**BER** ಎಂದರೆ ಒಟ್ಟು ಕಳುಹಿಸಲಾದ ಬಿಟ್‌ಗಳಲ್ಲಿ ಎಷ್ಟು ಬಿಟ್‌ಗಳು ದೋಷಪೂರಿತವಾಗಿವೆ ಎಂಬುದರ ಪ್ರಮಾಣ. 1D CNN ಮಾದರಿಯು BER ಅನ್ನು ಗಣನೀಯವಾಗಿ ತಗ್ಗಿಸುತ್ತದೆ.`,
      te: `### బిట్ ఎర్రర్ రేట్ (BER)

**BER** అనేది మొత్తం ప్రసారం చేయబడిన బిట్లలో లోపభూయిష్టంగా వచ్చిన బిట్ల శాతాన్ని సూచిస్తుంది. 1D CNN దీనిని భారీగా తగ్గిస్తుంది.`,
    },
  },

  // 13. NMSE
  nmse: {
    patterns: [
      /what is nmse/i,
      /normalized mean squared error/i,
      /explain nmse/i,
    ],
    responses: {
      en: `### Normalized Mean Squared Error (NMSE)

**NMSE** evaluates the mathematical accuracy of the estimated channel response $\\hat{H}$ relative to the true channel $H$:

$$\\text{NMSE}_{\\text{dB}} = 10 \\log_{10}\\left(\\frac{\\sum_{k=0}^{N-1} |H[k] - \\hat{H}[k]|^2}{\\sum_{k=0}^{N-1} |H[k]|^2}\\right)$$

- More negative values indicate higher estimation fidelity (e.g., $-20\\text{ dB}$ is superior to $-10\\text{ dB}$).
- In AI-RailLink, the 1D CNN typically achieves **$5 - 10\\text{ dB}$ lower NMSE** than the raw LS estimator under identical Doppler conditions.`,
      hi: `### नॉर्मलाइज्ड मीन स्क्वेयर्ड एरर (NMSE)

**NMSE** वास्तविक चैनल $H$ और अनुमानित चैनल $\\hat{H}$ के बीच की त्रुटि को मापता है:

$$\\text{NMSE}_{\\text{dB}} = 10 \\log_{10}\\left(\\frac{\\|H - \\hat{H}\\|^2}{\\|H\\|^2}\\right)$$

जितना अधिक नकारात्मक मान (जैसे $-20\\text{ dB}$), चैनल अनुमान उतना ही अधिक सटीक माना जाता है।`,
      kn: `### NMSE (Normalized Mean Squared Error)

**NMSE** ಚಾನಲ್ ಅಂದಾಜಿನ ನಿಖರತೆಯನ್ನು ಅಳೆಯುತ್ತದೆ. ಹೆಚ್ಚು ಋಣಾತ್ಮಕ ಮೌಲ್ಯವು (ಉದಾ: $-20\\text{ dB}$) ಅತ್ಯುತ್ತಮ ನಿಖರತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
      te: `### NMSE (నార్మలైజ్డ్ మీన్ స్క్వేర్డ్ ఎర్రర్)

**NMSE** అనేది ఛానల్ అంచనా ఎంత ఖచ్చితంగా ఉందో కొలిచే కొలమానం. నెగటివ్ విలువ ఎక్కువగా ఉంటే ఖచ్చితత్వం ఎక్కువ అని అర్థం.`,
    },
  },

  // 14. ZF Equalization
  zf: {
    patterns: [
      /what is zf/i,
      /zero forcing/i,
      /zf equalization/i,
      /equalization/i,
    ],
    responses: {
      en: `### Zero-Forcing (ZF) Equalization

**Zero-Forcing (ZF) Equalization** is a linear detection technique that inverts the estimated channel frequency response $\\hat{H}[k]$ to eliminate channel-induced distortion:

$$\\hat{X}[k] = \\frac{Y[k]}{\\hat{H}[k]}$$

**Crucial Characteristic:**
- If $\\hat{H}[k]$ is accurate (e.g. via 1D CNN), ZF perfectly recovers the transmitted QPSK/QAM constellation points.
- If $\\hat{H}[k]$ has errors (common in raw LS), division amplifies noise at deep channel nulls. Thus, high-quality 1D CNN estimation is paramount!`,
      hi: `### ज़ीरो-फोर्सिंग (ZF) इक्वलाइज़ेशन

**ZF इक्वलाइज़ेशन** एक रेखीय तकनीक है जो चैनल के प्रभाव $\\hat{H}[k]$ को उल्टा करके मूल डेटा सिग्नल्स को पुनः प्राप्त करती है:

$$\\hat{X}[k] = \\frac{Y[k]}{\\hat{H}[k]}$$

यदि 1D CNN द्वारा $\\hat{H}$ सटीक है, तो डेटा पूर्णतः शुद्ध प्राप्त होता है।`,
      kn: `### ಜೀರೋ-ಫೋರ್ಸಿಂಗ್ (ZF) ಈಕ್ವಲೈಜೇಶನ್

**ZF ಈಕ್ವಲೈಜೇಶನ್** ಚಾನಲ್ ಅಡಚಣೆಗಳನ್ನು ನಿವಾರಿಸಿ ಮೂಲ ಸಿಗ್ನಲ್ ಅನ್ನು ಮರುಪಡೆಯಲು ಬಳಸುವ ಗಣಿತ ವಿಧಾನವಾಗಿದೆ.`,
      te: `### జీరో-ఫోర్సింగ్ (ZF) ఈక్వలైజేషన్

**ZF ఈక్వలైజేషన్** ఛానల్ ద్వారా ఏర్పడిన అంతరాయాలను తొలగించి అసలు డేటాను తిరిగి పొందడానికి ఉపయోగపడుతుంది.`,
    },
  },

  // 15. Speed 300 km/h
  speed_300: {
    patterns: [
      /300 km\/h/i,
      /300km\/h/i,
      /300 kmh/i,
      /what happens at 300/i,
    ],
    responses: {
      en: `### Channel Behavior at 300 km/h (Vande Bharat / High-Speed Rail)

At **300 km/h** ($v = 83.33\\text{ m/s}$) on a $5.9\\text{ GHz}$ carrier:
- **Maximum Doppler Shift ($f_d$)**: $\\approx 1639\\text{ Hz}$.
- **Coherence Time ($T_c$)**: $T_c \\approx \\frac{0.423}{f_d} \\approx 258\\,\\mu\\text{s}$.
- **OFDM Symbol Duration ($T_s$)**: $80\\,\\mu\\text{s}$.
- **Key Challenge**: The channel changes significantly across just 3 OFDM symbols!
- **LS Performance**: LS estimation exhibits an error floor with BER $> 0.02$.
- **AI-RailLink Solution**: The 1D CNN denoises the rapid channel transitions, reducing BER to $< 0.002$.`,
      hi: `### 300 किमी/घंटा पर चैनल का व्यवहार (वंदे भारत एक्सप्रेस)

**300 km/h** ($5.9\\text{ GHz}$) पर:
- **अधिकतम डॉप्लर शिफ्ट**: $\\approx 1639\\text{ Hz}$
- **कोहेरेंस समय ($T_c$)**: केवल $258\\,\\mu\\text{s}$
- **चुनौती**: चैनल बहुत तेजी से बदलता है, जिससे सामान्य LS अनुमान विफल हो जाता है।
- **1D CNN का लाभ**: 1D CNN इस तेज बदलाव को ट्रैक कर BER को सुरक्षित सीमा में रखता है।`,
      kn: `### 300 ಕಿಮೀ/ಗಂಟೆ ವೇಗದಲ್ಲಿ ಚಾನಲ್ ನಡವಳಿಕೆ (ವಂದೇ ಭಾರತ್)

300 km/h ವೇಗದಲ್ಲಿ ಡಾಪ್ಲರ್ ಶಿಫ್ಟ್ ಸುಮಾರು **1639 Hz** ಆಗಿರುತ್ತದೆ. ಈ ತೀವ್ರ ಏರಿಳಿತವನ್ನು ನಿಭಾಯಿಸಲು 1D CNN ಮಾದರಿ ಅತ್ಯಂತ ಅಗತ್ಯವಾಗಿದೆ.`,
      te: `### 300 కిమీ/గం వేగం వద్ద ఛానల్ పనితీరు (వందే భారత్)

300 km/h వేగం వద్ద డాప్లర్ షిఫ్ట్ సుమారు **1639 Hz** ఉంటుంది. 1D CNN మోడల్ ఈ నష్టాన్ని నివారించి డేటాను రక్షిస్తుంది.`,
    },
  },

  // 16. Speed 500 km/h
  speed_500: {
    patterns: [
      /500 km\/h/i,
      /500km\/h/i,
      /500 kmh/i,
      /what happens at 500/i,
      /bullet train/i,
      /hyperloop/i,
    ],
    responses: {
      en: `### Channel Behavior at 500 km/h (Ultra High-Speed / Maglev)

At **500 km/h** ($v = 138.89\\text{ m/s}$) on $5.9\\text{ GHz}$:
- **Maximum Doppler Shift ($f_d$)**: $\\approx 2731\\text{ Hz}$.
- **Coherence Time ($T_c$)**: Drops below $155\\,\\mu\\text{s}$ (less than 2 OFDM symbols).
- **Severe ICI**: Subcarrier leakage destroys conventional orthogonality completely.
- **Why Classical Methods Fail**: Linear interpolation and LS methods break down completely.
- **Deep Learning Necessity**: The 1D CNN's non-linear spatial mapping is mandatory to maintain trackside train signaling and automatic train protection (ATP).`,
      hi: `### 500 किमी/घंटा पर चैनल का व्यवहार (अल्ट्रा हाई-स्पीड / बुलेट ट्रेन)

**500 km/h** पर:
- **डॉप्लर शिफ्ट**: $\\approx 2731\\text{ Hz}$
- **कोहेरेंस समय**: $155\\,\\mu\\text{s}$ से भी कम।
- **अत्यधिक ICI**: पारंपरिक तकनीकें पूरी तरह विफल हो जाती हैं। डीप लर्निंग 1D CNN ट्रेन सुरक्षा प्रणालियों को निरंतर चालू रखता है।`,
      kn: `### 500 ಕಿಮೀ/ಗಂಟೆ ವೇಗದಲ್ಲಿ (ಬುಲೆಟ್ ಟ್ರೈನ್)

500 km/h ವೇಗದಲ್ಲಿ ಡಾಪ್ಲರ್ ಶಿಫ್ಟ್ **2731 Hz** ಮೀರುತ್ತದೆ. ಸಾಂಪ್ರದಾಯಿಕ ವಿಧಾನಗಳು ವಿಫಲವಾದಾಗ 1D CNN ಸಂಪರ್ಕವನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.`,
      te: `### 500 కిమీ/గం వేగం వద్ద (బుల్లెట్ ట్రైన్)

500 km/h వేగం వద్ద డాప్లర్ షిఫ్ట్ **2731 Hz** వరకు చేరుకుంటుంది. 1D CNN డీప్ లెర్నింగ్ మాత్రమే స్థిరమైన కమ్యూనికేషన్‌ను అందించగలదు.`,
    },
  },

  // 17. High-Speed Railway Communication
  railway_comm: {
    patterns: [
      /high-speed railway communication/i,
      /railway communication/i,
      /rail communication/i,
      /train communication/i,
    ],
    responses: {
      en: `### High-Speed Railway Wireless Communication

High-Speed Railway (HSR) communication demands mission-critical reliability for Automatic Train Control (ATC/ETCS/Kavach), onboard signaling, and passenger internet.

**Core Technical Challenges:**
1. **Extreme Doppler Spread**: Speeds up to $500\\text{ km/h}$ create time-frequency selective fading.
2. **Rapid Handover**: Base stations passed every few seconds at $350\\text{ km/h}$.
3. **High Penetration Loss**: Modern metallic train carriages attenuate external signals.
4. **Multipath Reflection**: Catenary wires and railway tracks create dense, short-delay echoes.`,
      hi: `### हाई-स्पीड रेलवे वायरलेस संचार

हाई-स्पीड रेलवे (HSR) संचार ट्रेन सुरक्षा (कवच/ETCS), लोको पायलट नियंत्रण और यात्री सेवाओं के लिए अत्यंत महत्वपूर्ण है।

**प्रमुख चुनौतियाँ:**
1. तीव्र डॉप्लर प्रभाव (300-500 किमी/घंटा)
2. बार-बार और तीव्र हैंडओवर (Handover)
3. ट्रेन डिब्बों द्वारा सिग्नल में रुकावट
4. पटरियों और खंभों से मल्टीपाथ परावर्तन`,
      kn: `### ಹೈ-ಸ್ಪೀಡ್ ರೈಲ್ವೆ ವೈರ್‌ಲೆಸ್ ಸಂವಹನ

ರೈಲ್ವೆ ಸಂವಹನವು ಕವಚ್ (Kavach) ನಂತಹ ಸ್ವಯಂಚಾಲಿತ ರೈಲು ರಕ್ಷಣಾ ವ್ಯವಸ್ಥೆಗಳಿಗೆ ಅತ್ಯಂತ ನಿರ್ಣಾಯಕವಾಗಿದೆ. ಡಾಪ್ಲರ್ ಶಿಫ್ಟ್ ಮತ್ತು ಮಲ್ಟಿಪಾತ್ ಸವಾಲುಗಳನ್ನು ನಿಭಾಯಿಸಲು AI ತಂತ್ರಜ್ಞಾನ ಅಗತ್ಯ.`,
      te: `### హై-స్పీడ్ రైల్వే వైర్‌లెస్ కమ్యూనికేషన్

కవచ్ (Kavach) మరియు రైలు నియంత్రణ వ్యవస్థలకు హై-స్పీడ్ కమ్యూనికేషన్ చాలా కీలకం. AI-RailLink దీనికి ఆధునిక పరిష్కారాన్ని అందిస్తుంది.`,
    },
  },

  // 18. Project Pipeline
  project_pipeline: {
    patterns: [
      /explain the ai-raillink project/i,
      /explain the system pipeline/i,
      /system pipeline/i,
      /project architecture/i,
      /ai-raillink pipeline/i,
      /about the project/i,
    ],
    responses: {
      en: `### AI-RailLink End-to-End System Pipeline

AI-RailLink implements the full physical layer transmission chain:

1. **Bit Generation**: Random pseudo-noise binary data stream.
2. **Modulation**: M-ary mapping (QPSK / 16-QAM) with Gray coding.
3. **Framing & Pilots**: Insertion of 4 pilot symbols into 64 subcarriers.
4. **IFFT & Cyclic Prefix**: 64-point IFFT followed by 16-sample CP addition.
5. **High-Speed Channel**: Doppler shift ($f_d$), Rician/Rayleigh multipath, and AWGN noise.
6. **Receiver FFT**: CP stripping and 64-point FFT.
7. **LS Channel Estimation**: $\\hat{H}_{LS} = Y_p / X_p$ followed by interpolation.
8. **1D CNN Denoising**: Trained deep network filters $\\hat{H}_{LS} \\to \\hat{H}_{CNN}$.
9. **Zero-Forcing Equalization**: Channel inversion: $\\hat{X} = Y / \\hat{H}$.
10. **Demodulation & Metrics**: Bit slicing, BER calculation, and NMSE tracking.`,
      hi: `### AI-RailLink सिस्टम पाइपलाइन (System Pipeline)

1. **बिट जनरेशन**: बाइनरी डेटा उत्पन्न करना।
2. **मॉड्यूलेशन**: QPSK या 16-QAM मॉड्यूलेशन।
3. **पायलट जोड़ना**: 64 सबकैरियर्स में 4 पायलट सिंबल्स को शामिल करना।
4. **IFFT और CP**: 64-पॉइंट IFFT और 16-सैंपल साइक्लिक प्रीफिक्स।
5. **रेलवे चैनल**: डॉप्लर शिफ्ट, मल्टीपाथ फेडिंग और AWGN शोर।
6. **FFT रिसीवर**: CP हटाना और 64-पॉइंट FFT।
7. **LS चैनल आकलन**: $\\hat{H}_{LS} = Y_p / X_p$।
8. **1D CNN डिनॉइज़िंग**: डीप लर्निंग द्वारा चैनल का शुद्धिकरण।
9. **ZF इक्वलाइज़ेशन**: सिग्नल पुनर्प्राप्ति।
10. **डिमॉड्यूलेशन व मेट्रिक्स**: BER और NMSE की गणना।`,
      kn: `### AI-RailLink ಸಿಸ್ಟಮ್ ಪೈಪ್‌ಲೈನ್

ಬಿಟ್ ಜನರೇಷನ್ $\\to$ ಮಾಡ್ಯುಲೇಶನ್ (QPSK/16-QAM) $\\to$ ಪೈಲಟ್ ಅಳವಡಿಕೆ $\\to$ IFFT ಮತ್ತು CP $\\to$ ಹೈ-ಸ್ಪೀಡ್ ಚಾನಲ್ $\\to$ FFT ರಿಸೀವರ್ $\\to$ LS ಅಂದಾಜು $\\to$ 1D CNN ಶುದ್ಧೀಕರಣ $\\to$ ZF ಈಕ್ವಲೈಜೇಶನ್ $\\to$ BER/NMSE ಫಲಿತಾಂಶಗಳು.`,
      te: `### AI-RailLink సిస్టమ్ పైప్‌లైన్

బిట్ జనరేషన్ $\\to$ మాడ్యులేషన్ $\\to$ పైలట్ సింబల్స్ $\\to$ IFFT మరియు CP $\\to$ రైల్వే ఛానల్ $\\to$ FFT రిసీవర్ $\\to$ LS ఎస్టిమేషన్ $\\to$ 1D CNN ఫిల్టరింగ్ $\\to$ ZF ఈక్వలైజేషన్ $\\to$ BER/NMSE విశ్లేషణ.`,
    },
  },

  // 19. Doppler Mitigation
  doppler_mitigation: {
    patterns: [
      /doppler mitigation/i,
      /mitigate doppler/i,
      /how to handle doppler/i,
    ],
    responses: {
      en: `### Doppler Mitigation Techniques in High-Speed Rail

1. **1D CNN Channel Estimation**: Learns the frequency dispersion signature to counteract inter-carrier interference (ICI).
2. **Pilot-Assisted Phase Tracking**: Frequent pilot insertion tracks the carrier phase drift in real time.
3. **Cyclic Prefix Dimensioning**: CP duration selected to exceed channel maximum excess delay plus Doppler dispersion.
4. **Frequency Offset Compensation**: Baseband carrier frequency offset (CFO) estimation loops prior to FFT.`,
      hi: `### डॉप्लर शमन तकनीकें (Doppler Mitigation)

1. **1D CNN चैनल आकलन**: डॉप्लर विकृति को डीप लर्निंग से सुधारना।
2. **पायलट-आधारित फेज ट्रैकिंग**: लगातार फेज परिवर्तन की निगरानी।
3. **पर्याप्त साइक्लिक प्रीफिक्स**: मल्टीपाथ देरी को पूरी तरह सोखना।
4. **फ्रीक्वेंसी ऑफसेट सुधार**: रिसीवर पर ऑर्थोगोनैलिटी को फिर से स्थापित करना।`,
      kn: `### ಡಾಪ್ಲರ್ ತಡೆಗಟ್ಟುವ ತಂತ್ರಗಳು

1D CNN ಅಲ್ಗಾರಿದಮ್, ಪೈಲಟ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಸೈಕ್ಲಿಕ್ ಪ್ರಿಫಿಕ್ಸ್ ಮೂಲಕ ಡಾಪ್ಲರ್ ಪರಿಣಾಮವನ್ನು ಪರಿಣಾಮಕಾರಿಯಾಗಿ ನಿಯಂತ್ರಿಸಲಾಗುತ್ತದೆ.`,
      te: `### డాప్లర్ నివారణ పద్ధతులు

1D CNN మోడల్ మరియు పైలట్ ట్రాకింగ్ ఉపయోగించి డాప్లర్ నష్టాన్ని సులభంగా అధిగమించవచ్చు.`,
    },
  },

  // 20. Channel Frequency Response (CFR)
  cfr: {
    patterns: [
      /channel frequency response/i,
      /what is cfr/i,
      /explain cfr/i,
    ],
    responses: {
      en: `### Channel Frequency Response (CFR)

**Channel Frequency Response (CFR)**, denoted $H[k]$, represents the channel's complex gain (magnitude attenuation and phase shift) across each of the 64 OFDM subcarriers:

$$H[k] = \\sum_{l=0}^{L-1} h_l e^{-j 2\\pi k \\tau_l / N}$$

- In flat fading, $|H[k]|$ is constant across all subcarriers.
- In high-speed railway multipath fading, $|H[k]|$ exhibits deep spectral notches and peaks across the 64 subcarriers, requiring accurate estimation.`,
      hi: `### चैनल फ्रीक्वेंसी रिस्पॉन्स (CFR)

**CFR ($H[k]$)** 64 सबकैरियर्स में से प्रत्येक पर चैनल के जटिल लाभ (एम्प्लिट्यूड और फेज) को दर्शाता है। मल्टीपाथ और डॉप्लर के कारण यह विभिन्न सबकैरियर्स पर अलग-अलग होता है।`,
      kn: `### ಚಾನಲ್ ಆವರ್ತನ ಪ್ರತಿಕ್ರಿಯೆ (CFR)

**CFR ($H[k]$)** ಎಲ್ಲಾ 64 ಸಬ್‌ಕ್ಯಾರಿಯರ್‌ಗಳಲ್ಲಿ ಚಾನಲ್‌ನ ವೈಶಾಲ್ಯ ಮತ್ತು ಹಂತದ ಬದಲಾವಣೆಯನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ.`,
      te: `### ఛానల్ ఫ్రీక్వెన్సీ రెస్పాన్స్ (CFR)

**CFR ($H[k]$)** అనేది 64 సబ్-క్యారియర్‌లపై ఛానల్ కలిగించే ప్రభావాలను స్పష్టంగా వివరిస్తుంది.`,
    },
  },

  // 21. How does training work?
  training: {
    patterns: [
      /how does training work/i,
      /explain training/i,
      /cnn training/i,
      /train the model/i,
    ],
    responses: {
      en: `### How 1D CNN Training Works in AI-RailLink

1. **Dataset Generation**: Generates 2,000 to 10,000 realistic railway channel realizations across diverse velocities ($100 - 500\\text{ km/h}$) and SNRs ($0 - 30\\text{ dB}$).
2. **Inputs & Targets**:
   - **Input ($X$)**: Raw, noisy Least Squares estimate $\\hat{H}_{LS}$ (Shape: $[64, 2]$ for real/imaginary parts).
   - **Ground Truth Target ($y$)**: Exact generated channel frequency response $H_{true}$.
3. **Loss Function**: Mean Squared Error (MSE) measuring residual channel error.
4. **Optimization**: Adam Optimizer with learning rate $\\alpha = 0.001$.
5. **Inference**: Once trained, the saved weights denoise incoming live estimates in $<1\\text{ ms}$.`,
      hi: `### AI-RailLink में 1D CNN ट्रेनिंग कैसे काम करती है?

1. **डेटासेट निर्माण**: 100 से 500 किमी/घंटा और 0-30 dB SNR पर हजारों सिमुलेटेड चैनल उत्पन्न किए जाते हैं।
2. **इनपुट और टारगेट**:
   - **इनपुट ($X$)**: शोर युक्त LS चैनल आकलन $[64, 2]$
   - **टारगेट ($y$)**: वास्तविक शुद्ध चैनल $H_{true}$
3. **लॉस फंक्शन**: मीन स्क्वेयर्ड एरर (MSE)
4. **ऑप्टिमाइज़र**: Adam ऑप्टिमाइज़र
5. **इन्फरेंस**: प्रशिक्षित होने के बाद मॉडल 1ms से भी कम समय में वास्तविक समय में काम करता है।`,
      kn: `### 1D CNN ತರಬೇತಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?

ಸಾವಿರಾರು ಸಿಮ್ಯುಲೇಟೆಡ್ ಚಾನಲ್ ಡೇಟಾವನ್ನು ಬಳಸಿ, ನಾಯ್ಸ್ ಇರುವ LS ಇನ್‌ಪುಟ್ ಮತ್ತು ನಿಖರವಾದ ಟಾರ್ಗೆಟ್ ನಡುವೆ MSE ಲಾಸ್ ಕಡಿಮೆ ಮಾಡಲು Adam ಆಪ್ಟಿಮೈಜರ್ ಮೂಲಕ ಮಾದರಿಯನ್ನು ತರಬೇತಿಗೊಳಿಸಲಾಗುತ್ತದೆ.`,
      te: `### 1D CNN మోడల్ శిక్షణ ఎలా పనిచేస్తుంది?

వేలకొద్దీ రైల్వే ఛానల్ నమూనాల ద్వారా Adam ఆప్టిమైజర్ మరియు MSE లాస్ ఉపయోగించి మోడల్ శిక్షణ పొందుతుంది. ఇది రియల్-టైమ్‌లో వేగంగా పనిచేస్తుంది.`,
    },
  },

  // 22. Difference between LS and CNN
  ls_vs_cnn: {
    patterns: [
      /difference between ls and cnn/i,
      /ls vs cnn/i,
      /compare ls and cnn/i,
      /why is cnn better/i,
    ],
    responses: {
      en: `### Comparison: LS vs 1D CNN Channel Estimation

| Metric / Property | Conventional LS Estimator | AI-RailLink 1D CNN |
| :--- | :--- | :--- |
| **Noise Vulnerability** | High (amplifies noise at low SNR) | Ultra-Low (convolutional noise suppression) |
| **High Doppler ($300+$ km/h)** | Fails with high error floor (BER $> 0.05$) | Robust tracking (BER $< 0.002$) |
| **Subcarrier Correlation** | Completely ignores frequency correlation | Exploits spatial/frequency correlation |
| **Computational Complexity** | Simple single division ($O(N)$) | Lightweight Conv1D forward pass ($<1\\text{ ms}$) |
| **NMSE Performance** | Poor ($-10\\text{ dB}$ to $-15\\text{ dB}$) | Superior ($-20\\text{ dB}$ to $-25\\text{ dB}$) |`,
      hi: `### तुलना: पारंपरिक LS बनाम 1D CNN चैनल आकलन

| पैरामीटर | पारंपरिक LS एस्टीमेटर | AI-RailLink 1D CNN |
| :--- | :--- | :--- |
| **शोर के प्रति संवेदनशीलता** | अत्यधिक (कम SNR पर शोर बढ़ जाता है) | अत्यंत कम (डीप लर्निंग द्वारा शोर का दमन) |
| **उच्च गति (300+ किमी/घंटे)** | BER अत्यधिक ($> 0.05$) | स्थिर और सुरक्षित (BER $< 0.002$) |
| **सबकैरियर संबंध** | पूरी तरह अनदेखा करता है | गहन पैटर्न को सीखता है |
| **NMSE प्रदर्शन** | कमजोर ($-10$ से $-15\\text{ dB}$) | उत्कृष्ट ($-20$ से $-25\\text{ dB}$) |`,
      kn: `### ಹೋಲಿಕೆ: LS ಮತ್ತು 1D CNN ನಡುವಿನ ವ್ಯತ್ಯಾಸ

LS ವಿಧಾನವು ಸರಳವಾಗಿದ್ದರೂ ಶಬ್ದವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ ಮತ್ತು ಹೆಚ್ಚಿನ ವೇಗದಲ್ಲಿ ವಿಫಲವಾಗುತ್ತದೆ. ಆದರೆ 1D CNN ಶಬ್ದವನ್ನು ತೊಡೆದುಹಾಕಿ ಅತ್ಯುತ್ತಮ NMSE ಮತ್ತು ಕಡಿಮೆ BER ನೀಡುತ್ತದೆ.`,
      te: `### పోలిక: LS vs 1D CNN ఛానల్ ఎస్టిమేషన్

LS పద్ధతి శబ్దాన్ని పెంచుతుంది మరియు అధిక వేగం వద్ద విఫలమవుతుంది. 1D CNN నాయిస్‌ను పూర్తిగా తొలగించి స్థిరమైన మరియు ఖచ్చితమైన సమాచారాన్ని అందిస్తుంది.`,
    },
  },

  // 23. Dashboard Help
  dashboard_help: {
    patterns: [
      /help me understand the dashboard/i,
      /how to use the dashboard/i,
      /dashboard help/i,
      /explain the dashboard/i,
    ],
    responses: {
      en: `### How to Use the AI-RailLink Dashboard

1. **Control Center**: Use the top parameter sliders to set **Train Speed** (0–500 km/h), **SNR** (0–30 dB), and **Modulation** (QPSK/16-QAM).
2. **Quick Test**: Click **"Quick Test"** in the top bar or Simulator page to run an instant Monte Carlo OFDM transmission and evaluate BER/NMSE.
3. **Visual Analytics**:
   - **Constellation Diagram**: Shows received I/Q symbols before and after ZF equalization.
   - **CFR Plot**: Compares true channel response against LS and 1D CNN estimates across 64 subcarriers.
   - **BER vs SNR Curve**: Displays real-time Monte Carlo performance gains of 1D CNN over LS.
4. **AI Assistant**: Ask questions in English, Hindi, Kannada, or Telugu anytime!`,
      hi: `### AI-RailLink डैशबोर्ड का उपयोग कैसे करें?

1. **कंट्रोल सेंटर**: ट्रेन की गति (0-500 किमी/घंटा), SNR और मॉड्यूलेशन सेट करें।
2. **त्वरित परीक्षण (Quick Test)**: तुरंत OFDM ट्रांसमिशन चलाने के लिए **"Quick Test"** पर क्लिक करें।
3. **ग्राफ और परिणाम**:
   - **कॉन्स्टेलेशन आरेख (Constellation)**: प्राप्त I/Q सिग्नल्स को देखें।
   - **CFR प्लॉट**: 64 सबकैरियर्स में वास्तविक और CNN चैनल की तुलना करें।
   - **BER कर्व**: LS और CNN के प्रदर्शन की तुलना।
4. **AI सहायक**: हिंदी, अंग्रेजी, कन्नड़ या तेलुगु में कभी भी प्रश्न पूछें!`,
      kn: `### ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಬಳಸುವುದು ಹೇಗೆ?

1. ನಿಯತಾಂಕಗಳನ್ನು ಹೊಂದಿಸಿ (ವೇಗ, SNR, ಮಾಡ್ಯುಲೇಶನ್).
2. ಸಿಮ್ಯುಲೇಶನ್ ನಡೆಸಲು **"Quick Test"** ಕ್ಲಿಕ್ ಮಾಡಿ.
3. ಕಾನ್ಸ್ಟೆಲೇಶನ್ ಮತ್ತು BER ಚಾರ್ಟ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ.
4. AI ಅಸಿಸ್ಟೆಂಟ್ ಮೂಲಕ ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.`,
      te: `### డ్యాష్‌బోర్డ్ ఎలా ఉపయోగించాలి?

1. రైలు వేగం, SNR మరియు మాడ్యులేషన్ సెట్ చేయండి.
2. సిమ్యులేషన్ కోసం **"Quick Test"** పై క్లిక్ చేయండి.
3. చార్ట్‌లు మరియు విశ్లేషణను పరిశీలించండి.
4. AI అసిస్టెంట్ ద్వారా సహాయం పొందండి.`,
    },
  },
};

/**
 * Main function: getMockAIResponse(message, language, context)
 * Returns realistic AI-RailLink answers instantly.
 */
function getMockAIResponse(message, language = 'English', context = {}) {
  const lang = normalizeLanguage(language);
  const cleanMsg = String(message || '').trim().toLowerCase();

  // 1. Check if user asked to analyze current simulation results
  const isSimulationAnalysisQuery =
    cleanMsg.includes('analyze my simulation') ||
    cleanMsg.includes('explain my current result') ||
    cleanMsg.includes('explain result') ||
    cleanMsg.includes('analyze simulation') ||
    cleanMsg.includes('explain my current simulation') ||
    cleanMsg.includes('simulation result') ||
    cleanMsg.includes('ಸಿಮ್ಯುಲೇಶನ್ ವಿಶ್ಲೇಷಿಸಿ') ||
    cleanMsg.includes('सिमुलेशन का विश्लेषण') ||
    cleanMsg.includes('సిమ్యులేషన్ విశ్లేషించండి');

  if (isSimulationAnalysisQuery) {
    return analyzeSimulationContext(context, lang);
  }

  // 2. Iterate through topic patterns
  for (const [topicKey, topicData] of Object.entries(TOPIC_RESPONSES)) {
    const isMatch = topicData.patterns.some((pat) => pat.test(cleanMsg));
    if (isMatch) {
      const respObj = topicData.responses;
      return respObj[lang] || respObj.en;
    }
  }

  // 3. If context exists and user mentions "result" or "metrics"
  if ((cleanMsg.includes('result') || cleanMsg.includes('metric') || cleanMsg.includes('current')) && context && Object.keys(context).length > 0) {
    return analyzeSimulationContext(context, lang);
  }

  // 4. Default Intelligent Fallback
  return getDefaultResponse(message, lang);
}

function getDefaultResponse(userQuery, lang) {
  switch (lang) {
    case 'hi':
      return `### AI-RailLink तकनीकी सहायक (Offline Local AI)

मैं हाई-स्पीड रेलवे वायरलेस संचार और 1D CNN चैनल आकलन में आपकी सहायता के लिए तैयार हूँ।

आप मुझसे निम्नलिखित विषयों पर पूछ सकते हैं:
- **"Explain OFDM"**: 64-सबकैरियर OFDM और साइक्लिक प्रीफिक्स
- **"What is Doppler shift?"**: 300-500 किमी/घंटा पर गति का प्रभाव
- **"Explain 1D CNN"**: डीप लर्निंग द्वारा चैनल आकलन
- **"Difference between LS and CNN"**: प्रदर्शन तुलना
- **"Analyze my simulation"**: वर्तमान सिमुलेशन मेट्रिक्स का विश्लेषण`;

    case 'kn':
      return `### AI-RailLink ತಾಂತ್ರಿಕ ಸಹಾಯಕ (Offline Local AI)

ಹೈ-ಸ್ಪೀಡ್ ರೈಲ್ವೆ ಸಂವಹನ ಮತ್ತು 1D CNN ಚಾನಲ್ ಅಂದಾಜು ಕುರಿತು ಯಾವುದೇ ಮಾಹಿತಿ ಪಡೆಯಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ.

ನೀವು ಈ ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು:
- **"Explain OFDM"**: 64-ಸಬ್‌ಕ್ಯಾರಿಯರ್ OFDM ಕಾರ್ಯಾಚರಣೆ
- **"What is Doppler shift?"**: ಹೆಚ್ಚಿನ ವೇಗದ ಡಾಪ್ಲರ್ ಪರಿಣಾಮ
- **"Explain 1D CNN"**: ಡೀಪ್ ಲರ್ನಿಂಗ್ ಚಾನಲ್ ಅಂದಾಜು
- **"Analyze my simulation"**: ಪ್ರಸ್ತುತ ಫಲಿತಾಂಶಗಳ ವಿಶ್ಲೇಷಣೆ`;

    case 'te':
      return `### AI-RailLink సాంకేతిక సహాయకుడు (Offline Local AI)

హై-స్పీడ్ రైల్వే వైర్‌లెస్ కమ్యూనికేషన్ మరియు 1D CNN ఛానల్ ఎస్టిమేషన్ గురించి మీకు సహాయం చేయడానికి నేను సిద్ధంగా ఉన్నాను.

మీరు ఈ క్రింది విషయాల గురించి అడగవచ్చు:
- **"Explain OFDM"**: 64-సబ్-క్యారియర్ OFDM పనితీరు
- **"What is Doppler shift?"**: రైలు వేగం వల్ల ఏర్పడే డాప్లర్ మార్పు
- **"Explain 1D CNN"**: డీప్ లెర్నింగ్ ఛానల్ ఎస్టిమేషన్
- **"Analyze my simulation"**: ప్రస్తుత సిమ్యులేషన్ ఫలితాల విశ్లేషణ`;

    case 'en':
    default:
      return `### AI-RailLink Technical Assistant (Offline Local AI)

I am an integrated technical assistant specialized in high-speed railway communications, 64-subcarrier OFDM, and 1D CNN channel estimation.

You can ask me about any of the following topics:
- **"What is Doppler shift?"** &mdash; Impact at 300 km/h and 500 km/h
- **"Explain OFDM"** &mdash; 64-subcarrier physical layer, cyclic prefix, and pilots
- **"Explain 1D CNN"** &mdash; Deep learning denoising of LS channel estimates
- **"What is the difference between LS and CNN?"** &mdash; Quantitative comparison table
- **"Analyze my simulation"** &mdash; Instant physical layer diagnosis of your current run
- **"What is Rician vs Rayleigh fading?"** &mdash; Multipath propagation in rail corridors`;
  }
}

module.exports = {
  getMockAIResponse,
  analyzeSimulationContext,
};
