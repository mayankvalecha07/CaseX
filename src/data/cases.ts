import { InvestigationCase } from '../types';

export const INITIAL_CASES: InvestigationCase[] = [
  {
    id: 'NY-2026-0884',
    title: 'THE MIDNIGHT DIAMOND HEIST',
    type: 'HIGH-VALUE THEFT',
    location: 'APEX TOWER, PENTHOUSE 74, MANHATTAN, NY',
    incidentDate: '2026-07-14 02:35 EST',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    shortDescription: 'The 120-carat Blue Paragon Diamond vanished from a pressurized vault during a brief 90-second grid blackout. Security officer found incapacitated by aerosol neurotoxin.',
    fullBriefing: 'At 02:35 EST, Apex Tower experienced a localized electromagnetic transient that disabled primary auxiliary power to Penthouse 74 for exactly 92 seconds. When power was restored, the cryogenic laser vault had been cleanly breached using an acoustic frequency resonance cutter. Head of Security Marcus Vance was found unconscious near the terminal with trace diazepam derivatives. No alarms were triggered at street perimeter.',
    leadInvestigator: 'Det. Pulkit Gupta (DET-7091)',
    progress: 45,
    evidenceCount: 7,
    suspectCount: 4,
    witnessCount: 3,
    lastAccessed: '2026-08-22 19:40',
    themeColor: 'cyan',
    crimeScene: {
      name: 'Apex Tower Penthouse Vault & Study',
      environmentDescription: 'Modern minimalist luxury penthouse with shattered laser emitter, bypassed reinforced titanium safe, executive glass desk, and balcony access point overlooking Manhattan skyline.',
      dimensions: '14.2m x 9.8m',
      hotspots: [
        {
          id: 'cs-ny-1',
          name: 'Thermal Vault Door',
          x: 48,
          y: 36,
          type: 'PHYSICAL',
          importance: 'CRITICAL',
          description: 'Acoustic resonance micro-fractures along locking perimeter.',
          details: 'The safe dial mechanism shows zero physical brute-force scratches. Ultrasonic harmonic frequencies were applied to align magnetic tumblers instantly.',
          discoveredAt: '03:10 EST',
          collected: false,
          inspected: true,
          iconName: 'ShieldAlert'
        },
        {
          id: 'cs-ny-2',
          name: 'Shattered Champagne Flute',
          x: 24,
          y: 62,
          type: 'BIOLOGICAL',
          importance: 'HIGH',
          description: 'Stemware containing trace residue of fast-acting sedative.',
          details: 'Spectrometer analysis indicates Zolpidem-analog blended with vintage Dom Pérignon. Lip print identified on rim.',
          discoveredAt: '03:22 EST',
          collected: true,
          inspected: true,
          iconName: 'Wine'
        },
        {
          id: 'cs-ny-3',
          name: 'Balcony Grapple Mark',
          x: 82,
          y: 28,
          type: 'TRACE',
          importance: 'HIGH',
          description: 'Kevlar-weave synthetic fiber caught on terrace railing.',
          details: 'High-tensile black synthetic cord. The culprit rappelled from floor 78 rooftop crane or helicopter extraction.',
          uvOnly: true,
          discoveredAt: '04:05 EST',
          collected: false,
          inspected: false,
          iconName: 'Anchor'
        },
        {
          id: 'cs-ny-4',
          name: 'Hacked Keycard Reader',
          x: 64,
          y: 54,
          type: 'DIGITAL',
          importance: 'CRITICAL',
          description: 'Raspberry Pi Zero stealth cloner spliced into low-voltage junction.',
          details: 'Intercepted encrypted RFID handshake of Master Keycard #004 (assigned to Chief Curator Elena Rostova) at 01:14 EST.',
          discoveredAt: '03:45 EST',
          collected: true,
          inspected: true,
          iconName: 'Cpu'
        },
        {
          id: 'cs-ny-5',
          name: 'Glove Smudge on Display Glass',
          x: 45,
          y: 48,
          type: 'TRACE',
          importance: 'MEDIUM',
          description: 'Carbon-treated conductive polymer glove residue on pedestal display.',
          details: 'Used by high-end electrical technicians to avoid static discharge. Traces of titanium dioxide powder.',
          irOnly: true,
          discoveredAt: '04:20 EST',
          collected: false,
          inspected: false,
          iconName: 'Fingerprint'
        },
        {
          id: 'cs-ny-6',
          name: 'Burned USB Drive in Hearth',
          x: 18,
          y: 42,
          type: 'DIGITAL',
          importance: 'HIGH',
          description: 'Partially melted flash storage recovered from decorative fireplace.',
          details: 'Forensics retrieved partial ledger showing offshore cryptocurrency transfer of $1.4M designated as "Blue Contingency".',
          discoveredAt: '05:00 EST',
          collected: false,
          inspected: false,
          iconName: 'Flame'
        }
      ]
    },
    evidenceList: [
      {
        id: 'ev-ny-01',
        code: 'EVD-NY-884-01',
        title: 'Bypassed Cryo-Vault Cylinder',
        category: 'PHYSICAL',
        importance: 'CRITICAL',
        locationFound: 'Penthouse Vault Chamber',
        timestamp: '2026-07-14 03:10 EST',
        description: 'Titanium-alloy vault core sliced open via resonant laser without triggering pressure sensors.',
        forensicNotes: 'Laser frequency tuned precisely to 1064nm Nd:YAG industrial wavelength. Requires specialized engineering knowledge.',
        status: 'COLLECTED',
        tags: ['Tool Mark', 'Laser', 'High Tech'],
        analysisResults: {
          matchRate: 98,
          technician: 'Dr. Sarah Lin (Ballistics & Toolmarks)',
          details: 'Tool signature matches custom German orbital cutting tool registered to AeroTech Solutions.',
          verified: true
        }
      },
      {
        id: 'ev-ny-02',
        code: 'EVD-NY-884-02',
        title: 'Sedative-Laced Champagne Flute',
        category: 'BIOLOGICAL',
        importance: 'HIGH',
        locationFound: 'Executive Study Bar',
        timestamp: '2026-07-14 03:22 EST',
        description: 'Glassware containing high-potency micro-emulsion sedative that knocked out the guard within 12 seconds.',
        forensicNotes: 'Saliva swab yielded partial DNA profile: Female, heterozygous amelogenin, allele frequency match 89.4% with Elena Rostova.',
        status: 'COLLECTED',
        tags: ['DNA', 'Toxicology', 'Sedative'],
        analysisResults: {
          matchRate: 89,
          technician: 'Forensic Biochemist K. Patel',
          details: 'DNA profile matches Elena Rostova with 1 in 4.2 million probability exclusion.',
          verified: true
        }
      },
      {
        id: 'ev-ny-03',
        code: 'EVD-NY-884-03',
        title: 'Hardware RFID Interceptor Dongle',
        category: 'DIGITAL',
        importance: 'CRITICAL',
        locationFound: 'Corridor Access Terminal',
        timestamp: '2026-07-14 03:45 EST',
        description: 'Micro-controller taped inside drywall casing cloning encrypted NFC keycards.',
        forensicNotes: 'EEPROM logs show badge clone event at 01:14 EST. Transmitted data packets to IP 194.26.29.112 located in Zurich.',
        status: 'COLLECTED',
        tags: ['Hardware', 'Cyber', 'RFID'],
        analysisResults: {
          matchRate: 94,
          technician: 'Cyber Specialist Chen',
          details: 'IP tunnel authenticated with private key owned by "GhostCat" syndicate broker.',
          verified: true
        }
      },
      {
        id: 'ev-ny-04',
        code: 'EVD-NY-884-04',
        title: 'High-Tensile Black Kevlar Weave',
        category: 'TRACE',
        importance: 'HIGH',
        locationFound: 'Rooftop Balcony Railing',
        timestamp: '2026-07-14 04:05 EST',
        description: 'Synthetic aramid fiber snagged on ornamental gargoyle bracket.',
        forensicNotes: 'Military-spec 11mm static rappelling line manufactured exclusively for tactical extraction units.',
        status: 'INSPECTED',
        tags: ['Fiber', 'Tactical', 'Extraction']
      },
      {
        id: 'ev-ny-05',
        code: 'EVD-NY-884-05',
        title: 'Altered Security Roster Logbook',
        category: 'DOCUMENT',
        importance: 'MEDIUM',
        locationFound: 'Ground Floor Guard Desk',
        timestamp: '2026-07-14 04:30 EST',
        description: 'Digital sign-in sheet shows shift swap for Guard Marcus Vance authorized under forged supervisor signature.',
        forensicNotes: 'Digital cryptographic signature token generated from HR Director Arthur Sterling workstation at 18:40 previous evening.',
        status: 'UNINSPECTED',
        tags: ['Document', 'Insider', 'Forgery']
      },
      {
        id: 'ev-ny-06',
        code: 'EVD-NY-884-06',
        title: 'Synthetic Glove Powder Residue',
        category: 'TRACE',
        importance: 'MEDIUM',
        locationFound: 'Diamond Display Plinth',
        timestamp: '2026-07-14 04:20 EST',
        description: 'Fine talc and titanium dioxide powder transferred from insulating sterile glove.',
        forensicNotes: 'Elemental mass spectrometry reveals unique trace cobalt impurity matching clean-room gloves from Apex Labs.',
        status: 'UNINSPECTED',
        tags: ['Chemical', 'Residue']
      },
      {
        id: 'ev-ny-07',
        code: 'EVD-NY-884-07',
        title: 'Damaged Cryptographic Flash Drive',
        category: 'DIGITAL',
        importance: 'HIGH',
        locationFound: 'Fireplace Hearth',
        timestamp: '2026-07-14 05:00 EST',
        description: 'Corrupted USB ledger containing offshore escrow transaction for $1,400,000.',
        forensicNotes: 'Memory chip NAND flash reconstructed in forensic clean-room. Recipient address matches Victor Thorne cold wallet.',
        status: 'UNINSPECTED',
        tags: ['Crypto', 'Bribe', 'Motive']
      }
    ],
    suspects: [
      {
        id: 'susp-ny-01',
        name: 'Elena Rostova',
        alias: 'The Curator',
        age: 34,
        occupation: 'Chief Gemologist & Vault Curator',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        motive: 'Facing $3.2M luxury art debt; had direct access to override acoustic vault safeties.',
        alibi: 'Claims she was at the Soho Grand Hotel lounge until 03:00 AM with clients.',
        alibiStatus: 'DISPROVEN',
        riskScore: 92,
        riskLevel: 'CRITICAL',
        fingerprintMatch: 89,
        dnaMatch: 94,
        cyberFootprint: 'Burner phone pinged cell tower 400m from Apex Tower at 02:22 EST.',
        evidenceLinks: ['ev-ny-02', 'ev-ny-03', 'ev-ny-06'],
        status: 'PRIME SUSPECT',
        notes: 'DNA on poisoned champagne flute matches. Fabricated hotel receipt with altered timestamp.'
      },
      {
        id: 'susp-ny-02',
        name: 'Victor Thorne',
        alias: 'Viper',
        age: 42,
        occupation: 'Ex-Military Security Contractor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        motive: 'Expert in BASE jumping and tactical rooftop infiltration; recently terminated by Apex Corp.',
        alibi: 'Claims to have been asleep at his Queens apartment alone.',
        alibiStatus: 'QUESTIONABLE',
        riskScore: 78,
        riskLevel: 'HIGH',
        fingerprintMatch: 12,
        dnaMatch: 4,
        cyberFootprint: 'Purchased military tactical rope and thermal harness 5 days prior under fake LLC.',
        evidenceLinks: ['ev-ny-04', 'ev-ny-07'],
        status: 'SUSPECT',
        notes: 'Physical skillset matches extraction method perfectly. Offshore wallet received $1.4M escrow.'
      },
      {
        id: 'susp-ny-03',
        name: 'Arthur Sterling',
        alias: 'The Trustee',
        age: 58,
        occupation: 'Apex Tower Managing Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        motive: 'Tower insurance policy on the Blue Paragon pays out $45M in case of unrecovered theft.',
        alibi: 'Hosted charity gala on 50th floor until 01:30, seen on elevator CCTV leaving building.',
        alibiStatus: 'VERIFIED',
        riskScore: 35,
        riskLevel: 'LOW',
        fingerprintMatch: 5,
        dnaMatch: 0,
        cyberFootprint: 'Workstation forged the security guard shift swap, but likely compromised by malware.',
        evidenceLinks: ['ev-ny-05'],
        status: 'PERSON OF INTEREST',
        notes: 'Possible unwitting insider accomplice whose workstation credentials were hijacked.'
      },
      {
        id: 'susp-ny-04',
        name: 'Marcus Vance',
        alias: 'Night Guard',
        age: 29,
        occupation: 'Night Security Guard',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        motive: 'Suffered severe financial hardship; found unconscious at the scene.',
        alibi: 'On duty at penthouse desk, claims he was offered champagne by a masked guest.',
        alibiStatus: 'VERIFIED',
        riskScore: 18,
        riskLevel: 'LOW',
        fingerprintMatch: 95,
        dnaMatch: 0,
        cyberFootprint: 'Clean phone records; heavy sedation verified by hospital toxicology screening.',
        evidenceLinks: ['ev-ny-02'],
        status: 'CLEAR',
        notes: 'Victim of poisoning rather than active co-conspirator. Corroborates female intruder presence.'
      }
    ],
    witnesses: [
      {
        id: 'wit-ny-01',
        name: 'Marcus Vance',
        occupation: 'Night Duty Security Guard',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        credibility: 95,
        relationship: 'Guarding Vault during breach',
        statement: 'At around 02:18, Elena walked into the study wearing her curator pass. She brought two glasses of champagne saying we were celebrating the diamond’s upcoming Paris exhibition. I took two sips, my vision spun, and everything went black.',
        verificationStatus: 'VERIFIED',
        keyClues: ['Curator used genuine badge', 'Offered poisoned toast at 02:18', 'Blackout started shortly after'],
        interviewHistory: [
          {
            question: 'Did you see anyone else with Elena Rostova?',
            response: 'No, but I heard heavy footsteps on the outdoor balcony right as I was losing consciousness.',
            timestamp: '06:15 EST'
          },
          {
            question: 'Did the vault alarm sound when she entered?',
            response: 'No alarm sounded because she entered her personal six-digit biometric master code.',
            timestamp: '06:22 EST'
          }
        ]
      },
      {
        id: 'wit-ny-02',
        name: 'Chloe Bennett',
        occupation: 'Penthouse Concierge',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        credibility: 88,
        relationship: 'Monitored elevator lobby',
        statement: 'I saw Elena Rostova enter via the express elevator at 01:50 carrying a long black pelican briefcase. She looked nervous and avoided eye contact.',
        verificationStatus: 'VERIFIED',
        keyClues: ['Elena arrived at 01:50', 'Carried hard shell pelican case', 'Avoided front camera angle'],
        interviewHistory: [
          {
            question: 'Did you see Victor Thorne anywhere near the building?',
            response: 'I saw a dark SUV with tinted plates idling in the service alley around 02:30 with hazard lights on.',
            timestamp: '07:10 EST'
          }
        ]
      },
      {
        id: 'wit-ny-03',
        name: 'Gavin Ross',
        occupation: 'HVAC Night Maintenance Tech',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        credibility: 76,
        relationship: 'Sub-basement generator duty',
        statement: 'The main electrical breaker was tripped from an external shunt on the 480V transformer at 02:35. It was clearly a deliberate overload trigger.',
        verificationStatus: 'VERIFIED',
        keyClues: ['External power shunt at 02:35', 'Timed to disable laser grid', 'Required high voltage switchgear familiarity'],
        interviewHistory: [
          {
            question: 'Could the power outage be an accident?',
            response: 'Impossible. The circuit breaker bypass jumper was custom fabricated from copper tubing.',
            timestamp: '08:00 EST'
          }
        ]
      }
    ],
    timeline: [
      {
        id: 'tl-ny-01',
        time: '01:14 EST',
        date: '2026-07-14',
        title: 'Master Keycard Emulation',
        description: 'RFID sniffer device records Elena Rostova curator credentials and broadcasts payload to remote proxy.',
        source: 'CYBER-LOG',
        type: 'INCIDENT',
        verified: true
      },
      {
        id: 'tl-ny-01b',
        time: '01:50 EST',
        date: '2026-07-14',
        title: 'Elena Enters Penthouse',
        description: 'Curator arrives via private elevator 74 with sealed equipment pelican case.',
        source: 'CCTV-LOBBY',
        type: 'MOVEMENT',
        verified: true
      },
      {
        id: 'tl-ny-02',
        time: '02:18 EST',
        date: '2026-07-14',
        title: 'Guard Poisoning & Incapacitation',
        description: 'Guard Marcus Vance accepts sedative-laced Dom Pérignon flute; collapses within 40 seconds.',
        source: 'WITNESS',
        type: 'FORENSIC',
        verified: true
      },
      {
        id: 'tl-ny-03',
        time: '02:35 EST',
        date: '2026-07-14',
        title: 'Power Grid Shunt & Blackout',
        description: 'Sub-basement 480V breaker overloaded. Auxiliary generators take 92 seconds to engage.',
        source: 'DISPATCH',
        type: 'INCIDENT',
        verified: true
      },
      {
        id: 'tl-ny-04',
        time: '02:36 EST',
        date: '2026-07-14',
        title: 'Acoustic Laser Breach of Vault',
        description: 'Nd:YAG laser tool slices pressure cylinder; Blue Paragon Diamond extracted from pedestal.',
        source: 'FORENSIC',
        type: 'INCIDENT',
        verified: true
      },
      {
        id: 'tl-ny-05',
        time: '02:39 EST',
        date: '2026-07-14',
        title: 'Rooftop Tactical Extraction',
        description: 'Kevlar line deployed from terrace 74 to service alley getaway vehicle below.',
        source: 'TRACE',
        type: 'MOVEMENT',
        verified: true
      }
    ],
    cctvFeeds: [
      {
        id: 'cam-ny-01',
        camCode: 'CAM-01',
        locationName: 'PENTHOUSE ELEVATOR VESTIBULE',
        timestamp: '01:50:24 EST',
        status: 'ONLINE',
        anomalyDetected: true,
        anomalyDescription: 'Curator Rostova enters with heavy Pelican hardcase avoiding facial camera angle.',
        playbackDuration: 60,
        anomaliesAtTime: [14, 38],
        clueCaptured: true
      },
      {
        id: 'cam-ny-02',
        camCode: 'CAM-02',
        locationName: 'CRYO-VAULT PERIMETER',
        timestamp: '02:35:12 EST',
        status: 'INTERFERENCE',
        anomalyDetected: true,
        anomalyDescription: 'Heavy visual static and infrared EMP burst coinciding with diamond removal.',
        playbackDuration: 92,
        anomaliesAtTime: [5, 45, 80],
        clueCaptured: false
      },
      {
        id: 'cam-ny-03',
        camCode: 'CAM-03',
        locationName: 'TERRACE NORTH PERIMETER',
        timestamp: '02:39:40 EST',
        status: 'ONLINE',
        anomalyDetected: true,
        anomalyDescription: 'Silhouetted figure in high-altitude tactical wingsuit/harness descending past 60th floor.',
        playbackDuration: 45,
        anomaliesAtTime: [22],
        clueCaptured: true
      },
      {
        id: 'cam-ny-04',
        camCode: 'CAM-04',
        locationName: 'SERVICE ALLEY DOCK B',
        timestamp: '02:41:05 EST',
        status: 'ONLINE',
        anomalyDetected: true,
        anomalyDescription: 'Black SUV departing at high speed with disabled tail lights.',
        playbackDuration: 60,
        anomaliesAtTime: [31],
        clueCaptured: false
      }
    ],
    forensics: [
      {
        id: 'for-ny-01',
        category: 'DNA',
        title: 'Stemware Epithelial Swab Analysis',
        status: 'COMPLETED',
        matchConfidence: 99.4,
        sampleId: 'SMP-BIO-9921',
        findings: 'High-density epithelial skin cells recovered from champagne flute rim match Elena Rostova reference profile in CODIS database.',
        keyConclusions: 'Elena Rostova personally handled and drank from the glass used to drug the guard.',
        examiner: 'Chief Geneticist Dr. Amanda Cole',
        dateCompleted: '2026-07-14 09:30 EST',
        dataPoints: [
          { label: 'Allele Loci Match', value: '15/15' },
          { label: 'CODIS Error Prob', value: '1 in 4.2B' },
          { label: 'Sample Purity', value: '98.2%' }
        ]
      },
      {
        id: 'for-ny-02',
        category: 'TOXICOLOGY',
        title: 'Sedative Chemical Profiling',
        status: 'COMPLETED',
        matchConfidence: 96.8,
        sampleId: 'SMP-TOX-4410',
        findings: 'Liquid contains synthetic non-benzodiazepine GABA-A receptor modulator (compound Z-744), odorless and fast-dissolving.',
        keyConclusions: 'Custom pharmaceutical grade synthesis, likely sourced from overseas black-market chemistry labs.',
        examiner: 'Dr. Michael Chen',
        dateCompleted: '2026-07-14 11:15 EST',
        dataPoints: [
          { label: 'Compound Class', value: 'Z-Agonist' },
          { label: 'Onset Time', value: '15-30 sec' },
          { label: 'Lethal Index', value: 'Low Risk' }
        ]
      },
      {
        id: 'for-ny-03',
        category: 'SPECTRAL',
        title: 'Laser Cutting Frequency Analysis',
        status: 'COMPLETED',
        matchConfidence: 92.5,
        sampleId: 'SMP-MAT-7703',
        findings: 'Vaporized titanium slag displays micro-grooves from a 1064nm resonant frequency pulse cutter.',
        keyConclusions: 'Identical beam signature to laser systems leased by Victor Thorne tactical supply proxy.',
        examiner: 'Forensic Engineer S. Bradley',
        dateCompleted: '2026-07-14 14:00 EST',
        dataPoints: [
          { label: 'Wavelength', value: '1064 nm' },
          { label: 'Pulse Frequency', value: '45 kHz' },
          { label: 'Kerf Width', value: '0.12 mm' }
        ]
      }
    ],
    boardNodes: [
      { id: 'bn-1', type: 'SUSPECT', title: 'Elena Rostova', subtitle: 'Chief Curator', x: 220, y: 140, refId: 'susp-ny-01' },
      { id: 'bn-2', type: 'EVIDENCE', title: 'Poisoned Flute', subtitle: 'DNA Match 99.4%', x: 480, y: 120, refId: 'ev-ny-02' },
      { id: 'bn-3', type: 'SUSPECT', title: 'Victor Thorne', subtitle: 'Tactical Operative', x: 240, y: 380, refId: 'susp-ny-02' },
      { id: 'bn-4', type: 'EVIDENCE', title: 'Kevlar Rappel Line', subtitle: 'Balcony Terrace', x: 500, y: 360, refId: 'ev-ny-04' },
      { id: 'bn-5', type: 'MOTIVE', title: '$3.2M Art Debt', subtitle: 'Zurich Escrow Account', x: 120, y: 260 },
      { id: 'bn-6', type: 'WITNESS', title: 'Marcus Vance', subtitle: 'Guard Statement', x: 740, y: 200, refId: 'wit-ny-01' }
    ],
    boardConnections: [
      { id: 'bc-1', fromId: 'bn-1', toId: 'bn-2', label: 'Epithelial DNA match' },
      { id: 'bc-2', fromId: 'bn-1', toId: 'bn-5', label: 'Financial Debt' },
      { id: 'bc-3', fromId: 'bn-3', toId: 'bn-4', label: 'Tactical gear purchase' },
      { id: 'bc-4', fromId: 'bn-2', toId: 'bn-6', label: 'Given to guard' },
      { id: 'bc-5', fromId: 'bn-1', toId: 'bn-3', label: 'Coordinated heist' }
    ],
    deductionMetrics: {
      evidenceSynthesisScore: 88,
      timelineCoherence: 96,
      suspectCorrelation: 91,
      solvabilityRating: 94,
      primaryHypothesis: 'Inside job coordinated between Curator Elena Rostova (biometric access & guard drugging) and Contractor Victor Thorne (rooftop entry, vault resonant laser cut & extraction).',
      contradictionsCount: 0,
      keyFindings: [
        'Elena Rostova DNA confirmed on poisoned champagne flute used to drug the guard.',
        'Her alibi was disproven via cell tower triangulation and lobby CCTV footage at 01:50.',
        'Victor Thorne tactical equipment matches the rooftop rappel rope and laser kerf profile.'
      ]
    },
    warrantData: {
      eligibleSuspectId: 'susp-ny-01',
      minimumEvidenceRequired: 3,
      legalCriteria: [
        'Biological DNA evidence directly linking suspect to incapacitation of vault guard',
        'Disproven alibi with timestamped video surveillance corroboration',
        'Demonstrated motive with active offshore financial paper trail'
      ]
    }
  },

  {
    id: 'LA-2026-0317',
    title: 'THE SILENT WITNESS',
    type: 'UNSOLVED HOMICIDE',
    location: 'BEL-AIR CREST RESIDENCE, LOS ANGELES, CA',
    incidentDate: '2026-03-17 23:45 PST',
    status: 'UNDER INVESTIGATION',
    priority: 'HIGH',
    shortDescription: 'AI neuro-tech founder Warren Sterling discovered deceased in soundproof home theater. Smart home AI assistant was selectively wiped 4 minutes before death.',
    fullBriefing: 'Warren Sterling, pioneer of direct neural interface interfaces, was found in his soundproof screening pavilion. Cause of death was acute potassium chloride induced arrhythmia masked as cardiac failure. The estate’s central AI ambient voice recorder was selectively zeroed for timestamps 23:30 to 23:55. However, analog magnetic tape backups in the climate closet remained untouched.',
    leadInvestigator: 'Det. Pulkit Gupta (DET-7091)',
    progress: 30,
    evidenceCount: 6,
    suspectCount: 3,
    witnessCount: 3,
    lastAccessed: '2026-08-22 18:15',
    themeColor: 'purple',
    crimeScene: {
      name: 'Bel-Air Crest Smart Pavilion & Audio Suite',
      environmentDescription: 'Acoustically isolated private cinema, biometric recliner chair, automated whiskey dispensary, server closet with blinking RAID lights, and glass garden patio door.',
      dimensions: '12.0m x 8.5m',
      hotspots: [
        {
          id: 'cs-la-1',
          name: 'Crystal Scotch Tumbler',
          x: 42,
          y: 58,
          type: 'BIOLOGICAL',
          importance: 'CRITICAL',
          description: 'High-end crystal glass with concentrated potassium chloride and almond essence.',
          details: 'Spectrometer detected KCl in fatal dosage mixed with 25-year Macallan. Smudge on base holds thumbprint.',
          discoveredAt: '01:20 PST',
          collected: true,
          inspected: true,
          iconName: 'Wine'
        },
        {
          id: 'cs-la-2',
          name: 'Corrupted Smart Speaker Hub',
          x: 68,
          y: 32,
          type: 'DIGITAL',
          importance: 'CRITICAL',
          description: 'Smart ambient audio microphone array with burnt flash memory sector.',
          details: 'Firmware debug log reveals an admin credential override initiated from local IP 192.168.1.104 (belonging to Dr. Julian Vance).',
          discoveredAt: '01:45 PST',
          collected: false,
          inspected: true,
          iconName: 'Mic'
        },
        {
          id: 'cs-la-3',
          name: 'Analog Reel-to-Reel Recorder',
          x: 88,
          y: 44,
          type: 'DIGITAL',
          importance: 'HIGH',
          description: 'Vintage Nagra tape machine running on secondary acoustic line.',
          details: 'Captured ambient argument between Warren Sterling and an unidentified female associate regarding patent theft.',
          discoveredAt: '02:10 PST',
          collected: false,
          inspected: false,
          iconName: 'Disc'
        },
        {
          id: 'cs-la-4',
          name: 'Muddy Shoe Impression on Patio',
          x: 18,
          y: 72,
          type: 'TRACE',
          importance: 'HIGH',
          description: 'Size 9 Italian leather loafer print with botanical orchid fertilizer residue.',
          details: 'Tread matches bespoke Ferragamo Oxford worn by Co-founder Julian Vance.',
          uvOnly: true,
          discoveredAt: '02:30 PST',
          collected: false,
          inspected: false,
          iconName: 'Footprints'
        }
      ]
    },
    evidenceList: [
      {
        id: 'ev-la-01',
        code: 'EVD-LA-317-01',
        title: 'Potassium Chloride Scotch Tumbler',
        category: 'BIOLOGICAL',
        importance: 'CRITICAL',
        locationFound: 'Home Theater Side Table',
        timestamp: '2026-03-18 01:20 PST',
        description: 'Crystal glass containing fatal 300mg/dL lethal dose of potassium chloride.',
        forensicNotes: 'Victim drank approximately 45ml before immediate coronary collapse.',
        status: 'COLLECTED',
        tags: ['Poison', 'Toxicology', 'Lethal'],
        analysisResults: {
          matchRate: 97,
          technician: 'Dr. Evelyn Reed',
          details: 'Poison compound engineered to mimic natural cardiac myocardial infarction.',
          verified: true
        }
      },
      {
        id: 'ev-la-02',
        code: 'EVD-LA-317-02',
        title: 'Smart Hub Admin Access Logs',
        category: 'DIGITAL',
        importance: 'CRITICAL',
        locationFound: 'Smart Home Server Rack',
        timestamp: '2026-03-18 01:45 PST',
        description: 'System log showing selective audio deletion command sent at 23:42 PST.',
        forensicNotes: 'Command executed with cryptographic root certificate issued to Dr. Julian Vance.',
        status: 'COLLECTED',
        tags: ['Cyber', 'Wipe', 'Root Access'],
        analysisResults: {
          matchRate: 99,
          technician: 'Cyber Specialist Chen',
          details: 'Root key 0x9AF21 matching Vance workstation private keyring.',
          verified: true
        }
      },
      {
        id: 'ev-la-03',
        code: 'EVD-LA-317-03',
        title: 'Analog Magnetic Audio Tape #4',
        category: 'DIGITAL',
        importance: 'HIGH',
        locationFound: 'Climate Controlled Media Vault',
        timestamp: '2026-03-18 02:10 PST',
        description: 'High-fidelity audio recording capturing final words and sound of syringe plunger.',
        forensicNotes: 'Audio analysis isolates acoustic resonance of Dr. Julian Vance distinct vocal timbre.',
        status: 'INSPECTED',
        tags: ['Audio', 'Recording', 'Acoustic']
      },
      {
        id: 'ev-la-04',
        code: 'EVD-LA-317-04',
        title: 'Patio Orchid Fertilizer Loafer Cast',
        category: 'TRACE',
        importance: 'HIGH',
        locationFound: 'Garden Patio Threshold',
        timestamp: '2026-03-18 02:30 PST',
        description: 'Electrostatic dust lifter print matching size 9 Ferragamo dress shoe.',
        forensicNotes: 'Soil matrix contains rare Japanese volcanic orchid potting soil only used in Vance greenhouse.',
        status: 'UNINSPECTED',
        tags: ['Shoe Print', 'Soil', 'Geology']
      },
      {
        id: 'ev-la-05',
        code: 'EVD-LA-317-05',
        title: 'Modified Syringe Plunger Cap',
        category: 'PHYSICAL',
        importance: 'CRITICAL',
        locationFound: 'Garden Fountain Drain',
        timestamp: '2026-03-18 03:00 PST',
        description: 'Medical grade 10ml syringe cap with traces of concentrated KCl solution.',
        forensicNotes: 'Fingerprint match to Dr. Julian Vance left index finger.',
        status: 'UNINSPECTED',
        tags: ['Medical', 'Syringe', 'DNA']
      },
      {
        id: 'ev-la-06',
        code: 'EVD-LA-317-06',
        title: 'Severance & IP Buyout Contract',
        category: 'DOCUMENT',
        importance: 'MEDIUM',
        locationFound: 'Executive Desk Drawer',
        timestamp: '2026-03-18 03:20 PST',
        description: 'Unsigned contract forcing Dr. Vance out of NeuralSync without stock rights.',
        forensicNotes: 'Dated March 17th with Sterling signature already executed.',
        status: 'UNINSPECTED',
        tags: ['Contract', 'Motive']
      }
    ],
    suspects: [
      {
        id: 'susp-la-01',
        name: 'Dr. Julian Vance',
        alias: 'The Architect',
        age: 44,
        occupation: 'Chief Neural Architect & Co-Founder',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        motive: 'Was being ousted from NeuralSync prior to $2B IPO and losing all IP patents.',
        alibi: 'Claims he was working late in his private studio in Santa Monica.',
        alibiStatus: 'DISPROVEN',
        riskScore: 95,
        riskLevel: 'CRITICAL',
        fingerprintMatch: 97,
        dnaMatch: 92,
        cyberFootprint: 'Private root key used to wipe smart home audio logs at 23:42 PST.',
        evidenceLinks: ['ev-la-01', 'ev-la-02', 'ev-la-03', 'ev-la-05'],
        status: 'PRIME SUSPECT',
        notes: 'Syringe cap in fountain bears his fingerprint. Smart audio wipe executed from his root certificate.'
      },
      {
        id: 'susp-la-02',
        name: 'Clara Sterling',
        alias: 'The Heiress',
        age: 38,
        occupation: 'Venture Capitalist & Spouse',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
        motive: 'Sole beneficiary of $85M life insurance policy and estate trust.',
        alibi: 'Was dining at Nobu Malibu with friends until 23:15, arrived home 00:30.',
        alibiStatus: 'VERIFIED',
        riskScore: 40,
        riskLevel: 'MEDIUM',
        fingerprintMatch: 15,
        dnaMatch: 8,
        cyberFootprint: 'Valet and highway toll cameras verify Malibu transit timeline.',
        evidenceLinks: ['ev-la-06'],
        status: 'PERSON OF INTEREST',
        notes: 'Alibi confirmed by multiple witnesses and toll road fast-trak sensors.'
      },
      {
        id: 'susp-la-03',
        name: 'Damian Cross',
        alias: 'The Head of Security',
        age: 48,
        occupation: 'Estate Security Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        motive: 'Had knowledge of security blind spots; recent dispute over unpaid bonuses.',
        alibi: 'On patrol at gatehouse perimeter.',
        alibiStatus: 'VERIFIED',
        riskScore: 22,
        riskLevel: 'LOW',
        fingerprintMatch: 4,
        dnaMatch: 0,
        cyberFootprint: 'Log files show he called 911 immediately upon discovering the body.',
        evidenceLinks: [],
        status: 'CLEAR',
        notes: 'Cooperated fully with police and provided security master key logs.'
      }
    ],
    witnesses: [
      {
        id: 'wit-la-01',
        name: 'Damian Cross',
        occupation: 'Estate Security Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        credibility: 92,
        relationship: 'First responder / Head of Security',
        statement: 'At 00:05, I did my standard perimeter walk. The screening room glass door was unlatched. I found Mr. Sterling motionless on the leather recliner with his drink spilled. I dialed paramedics at 00:07.',
        verificationStatus: 'VERIFIED',
        keyClues: ['Screening room door unlatched', 'Drink spilled on carpet', 'Paramedics called at 00:07'],
        interviewHistory: [
          {
            question: 'Did Dr. Vance visit the estate earlier that night?',
            response: 'Yes, Dr. Vance arrived around 23:10 in his dark Porsche Taycan. He said he had an urgent IP meeting with Warren.',
            timestamp: '03:15 PST'
          }
        ]
      },
      {
        id: 'wit-la-02',
        name: 'Maya Lin',
        occupation: 'NeuralSync Chief Operating Officer',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
        credibility: 90,
        relationship: 'Business partner',
        statement: 'Warren and Julian had a shouting match during Monday’s board meeting. Warren told Julian he was being terminated for fabricating neural telemetry safety tests.',
        verificationStatus: 'VERIFIED',
        keyClues: ['Termination dispute on Monday', 'Fabricated safety test allegations', 'Major financial motive'],
        interviewHistory: [
          {
            question: 'Was Dr. Vance capable of synthesizing chemical poisons?',
            response: 'Julian holds a PhD in Bio-organic Chemistry from Caltech. He synthesized custom peptide carriers for our neural probes.',
            timestamp: '04:30 PST'
          }
        ]
      },
      {
        id: 'wit-la-03',
        name: 'Dr. Evelyn Reed',
        occupation: 'Deputy Medical Examiner',
        avatar: 'https://images.unsplash.com/photo-1594824813588-468249a59cf6?w=400&auto=format&fit=crop&q=80',
        credibility: 98,
        relationship: 'Forensic Medical Examiner',
        statement: 'The victim had zero prior history of cardiovascular disease. High serum potassium concentrations confirmed unabsorbed KCl in the gastric contents.',
        verificationStatus: 'VERIFIED',
        keyClues: ['Hyperkalemia induced cardiac arrest', 'Unabsorbed KCl in stomach', 'Fatal within 120 seconds'],
        interviewHistory: [
          {
            question: 'Was there any sign of struggle?',
            response: 'No defensive bruises, indicating the toxin was consumed voluntarily in his drink.',
            timestamp: '05:00 PST'
          }
        ]
      }
    ],
    timeline: [
      {
        id: 'tl-la-01',
        time: '23:10 PST',
        date: '2026-03-17',
        title: 'Dr. Vance Gate Arrival',
        description: 'Julian Vance logs through gatehouse security in Porsche Taycan for private meeting.',
        source: 'GATE-LOG',
        type: 'MOVEMENT',
        verified: true
      },
      {
        id: 'tl-la-02',
        time: '23:25 PST',
        date: '2026-03-17',
        title: 'Heated IP Dispute in Theater',
        description: 'Analog tape records argument regarding patent ownership and severance contract.',
        source: 'AUDIO',
        type: 'COMMUNICATION',
        verified: true
      },
      {
        id: 'tl-la-03',
        time: '23:38 PST',
        date: '2026-03-17',
        title: 'Scotch Poured & Poison Injected',
        description: 'Potassium chloride introduced into vintage scotch tumbler.',
        source: 'FORENSIC',
        type: 'INCIDENT',
        verified: true
      },
      {
        id: 'tl-la-04',
        time: '23:42 PST',
        date: '2026-03-17',
        title: 'Smart Hub Audio Deletion',
        description: 'Root certificate command sent to erase audio buffer on smart speaker.',
        source: 'CYBER-LOG',
        type: 'INCIDENT',
        verified: true
      },
      {
        id: 'tl-la-05',
        time: '23:49 PST',
        date: '2026-03-17',
        title: 'Suspect Exits via Patio',
        description: 'Vance leaves shoe print in garden soil, drops syringe cap in fountain.',
        source: 'TRACE',
        type: 'MOVEMENT',
        verified: true
      }
    ],
    cctvFeeds: [
      {
        id: 'cam-la-01',
        camCode: 'CAM-01',
        locationName: 'GATEHOUSE PERIMETER DRIVEWAY',
        timestamp: '23:10:04 PST',
        status: 'ONLINE',
        anomalyDetected: true,
        anomalyDescription: 'Porsche Taycan enters with single occupant.',
        playbackDuration: 60,
        anomaliesAtTime: [12],
        clueCaptured: true
      },
      {
        id: 'cam-la-02',
        camCode: 'CAM-02',
        locationName: 'PATIO GARDEN PATH',
        timestamp: '23:49:18 PST',
        status: 'ONLINE',
        anomalyDetected: true,
        anomalyDescription: 'Subject seen discarding small object into fountain basin before exiting.',
        playbackDuration: 45,
        anomaliesAtTime: [18],
        clueCaptured: true
      }
    ],
    forensics: [
      {
        id: 'for-la-01',
        category: 'TOXICOLOGY',
        title: 'Gastric & Serum Electrolyte Assay',
        status: 'COMPLETED',
        matchConfidence: 99.1,
        sampleId: 'SMP-LA-TOX-101',
        findings: 'Serum potassium level reached 14.8 mEq/L (normal is 3.5-5.0). Pure analytical grade KCl.',
        keyConclusions: 'Deliberate poisoning with rapid ventricular fibrillation and cardiac standstill.',
        examiner: 'Dr. Evelyn Reed',
        dateCompleted: '2026-03-18 06:00 PST',
        dataPoints: [
          { label: 'Serum K+ Level', value: '14.8 mEq/L' },
          { label: 'Toxic Dosage', value: 'Exceeded 400%' },
          { label: 'Time to Cardiac Arrest', value: '< 90 sec' }
        ]
      },
      {
        id: 'for-la-02',
        category: 'FINGERPRINT',
        title: 'Syringe Cap Latent Print',
        status: 'COMPLETED',
        matchConfidence: 97.4,
        sampleId: 'SMP-LA-FP-202',
        findings: 'Clean thumb and index print lifted using cyanoacrylate fuming from fountain plastic cap.',
        keyConclusions: '12-point biometric match with Dr. Julian Vance State ID.',
        examiner: 'Analyst K. Washington',
        dateCompleted: '2026-03-18 07:30 PST',
        dataPoints: [
          { label: 'Minutiae Points', value: '12 / 12' },
          { label: 'Print Clarity', value: 'Grade A' },
          { label: 'AFIS Database Match', value: 'Confirmed' }
        ]
      }
    ],
    boardNodes: [
      { id: 'bn-la-1', type: 'SUSPECT', title: 'Dr. Julian Vance', subtitle: 'Co-Founder', x: 220, y: 160, refId: 'susp-la-01' },
      { id: 'bn-la-2', type: 'EVIDENCE', title: 'Syringe Cap', subtitle: 'Fountain Basin', x: 490, y: 140, refId: 'ev-la-05' },
      { id: 'bn-la-3', type: 'EVIDENCE', title: 'Root Audio Wipe', subtitle: 'Smart Speaker Hub', x: 220, y: 380, refId: 'ev-la-02' },
      { id: 'bn-la-4', type: 'MOTIVE', title: '$2B IPO Ouster', subtitle: 'IP Severance Agreement', x: 100, y: 260 },
      { id: 'bn-la-5', type: 'WITNESS', title: 'Damian Cross', subtitle: 'Security Statement', x: 520, y: 360, refId: 'wit-la-01' }
    ],
    boardConnections: [
      { id: 'bc-la-1', fromId: 'bn-la-1', toId: 'bn-la-2', label: '12-point fingerprint' },
      { id: 'bc-la-2', fromId: 'bn-la-1', toId: 'bn-la-3', label: 'Private root key used' },
      { id: 'bc-la-3', fromId: 'bn-la-1', toId: 'bn-la-4', label: 'Forced termination' },
      { id: 'bc-la-4', fromId: 'bn-la-5', toId: 'bn-la-1', label: 'Saw arrival at 23:10' }
    ],
    deductionMetrics: {
      evidenceSynthesisScore: 92,
      timelineCoherence: 95,
      suspectCorrelation: 96,
      solvabilityRating: 98,
      primaryHypothesis: 'Dr. Julian Vance poisoned Warren Sterling with laboratory-grade potassium chloride to prevent patent forfeiture before NeuralSync IPO, then attempted to sanitize the smart home audio recording.',
      contradictionsCount: 0,
      keyFindings: [
        'Fingerprint on syringe cap recovered from garden fountain matches Julian Vance.',
        'Julian Vance root cryptographic key was used to wipe audio 3 minutes prior to death.',
        'Soil on Vance Ferragamo shoe matches the exact garden flowerbed soil matrix.'
      ]
    },
    warrantData: {
      eligibleSuspectId: 'susp-la-01',
      minimumEvidenceRequired: 3,
      legalCriteria: [
        'Biometric fingerprint on instrument of poisoning (syringe cap)',
        'Digital root cryptographic audit trail confirming audio destruction',
        'Physical soil trace linking suspect to crime scene escape path'
      ]
    }
  },

  {
    id: 'LDN-2026-0521',
    title: 'THE VANISHING ARCHIVE',
    type: 'DIGITAL THEFT & CYBER ESPIONAGE',
    location: 'CITY OF LONDON FINANCIAL DISTRICT, UK',
    incidentDate: '2026-05-21 04:12 GMT',
    status: 'ACTIVE',
    priority: 'HIGH',
    shortDescription: 'Quantum-resistant encryption ledger containing sovereign wealth fund transaction keys wiped from subterranean cold server vault with zero remote intrusion logs.',
    fullBriefing: 'At 04:12 GMT, the primary cryptographic hardware security module (HSM) at St. Jude Financial Vault was physically tapped via a micro-fiber optic splice. Over 40,000 transaction keys were exfiltrated before memory cells were purged with liquid nitrogen cooling failure.',
    leadInvestigator: 'Det. Pulkit Gupta (DET-7091)',
    progress: 20,
    evidenceCount: 5,
    suspectCount: 3,
    witnessCount: 2,
    lastAccessed: '2026-08-22 17:00',
    themeColor: 'emerald',
    crimeScene: {
      name: 'Subterranean Quantum Server Bunker B-3',
      environmentDescription: 'Climate-controlled cleanroom datacenter with perforated anti-static flooring, cryogenic coolant lines, server racks, and Faraday cage perimeter.',
      dimensions: '18.0m x 11.0m',
      hotspots: [
        {
          id: 'cs-ldn-1',
          name: 'Spliced Fiber Optic Cable',
          x: 52,
          y: 44,
          type: 'DIGITAL',
          importance: 'CRITICAL',
          description: 'Micro-prism optical tap clamped onto high-speed DWDM trunk.',
          details: 'Extracted light pulses with minimal signal attenuation, bypassing automated packet loss triggers.',
          discoveredAt: '05:30 GMT',
          collected: true,
          inspected: true,
          iconName: 'Cpu'
        },
        {
          id: 'cs-ldn-2',
          name: 'Cloned Security Badge Reader',
          x: 22,
          y: 60,
          type: 'PHYSICAL',
          importance: 'HIGH',
          description: 'Access terminal logged Deputy Director Charles Montgomery at 03:55 GMT.',
          details: 'Montgomery was confirmed in Edinburgh on vacation; his cryptographic fob was duplicated using a specialized SDR cloner.',
          discoveredAt: '05:45 GMT',
          collected: false,
          inspected: true,
          iconName: 'ShieldAlert'
        },
        {
          id: 'cs-ldn-3',
          name: 'Discarded Liquid Nitrogen Canister',
          x: 75,
          y: 70,
          type: 'TRACE',
          importance: 'MEDIUM',
          description: 'Pressurized dewar flask with serial number filed down.',
          details: 'Used to freeze tamper-detection switches on the physical HSM enclosure.',
          uvOnly: true,
          discoveredAt: '06:15 GMT',
          collected: false,
          inspected: false,
          iconName: 'Flame'
        }
      ]
    },
    evidenceList: [
      {
        id: 'ev-ldn-01',
        code: 'EVD-LDN-521-01',
        title: 'Micro-Prism Fiber Optical Tap',
        category: 'DIGITAL',
        importance: 'CRITICAL',
        locationFound: 'Server Rack 09 Trunk Cable',
        timestamp: '2026-05-21 05:30 GMT',
        description: 'Military-grade passive fiber coupler with internal 128GB flash buffer.',
        forensicNotes: 'Manufactured by specialized precision optics firm in Geneva.',
        status: 'COLLECTED',
        tags: ['Cyber', 'Hardware', 'Optics']
      },
      {
        id: 'ev-ldn-02',
        code: 'EVD-LDN-521-02',
        title: 'SDR Radio Cloner Transceiver',
        category: 'PHYSICAL',
        importance: 'HIGH',
        locationFound: 'Air Duct Grate',
        timestamp: '2026-05-21 05:45 GMT',
        description: 'Software-defined radio capable of capturing 13.56 MHz RFID challenges from 2 meters.',
        forensicNotes: 'Serial number linked to purchase by contractor Liam Gallagher.',
        status: 'COLLECTED',
        tags: ['Radio', 'SDR', 'Hardware']
      }
    ],
    suspects: [
      {
        id: 'susp-ldn-01',
        name: 'Liam Gallagher',
        alias: 'GhostWire',
        age: 36,
        occupation: 'Lead Datacenter Infrastructure Engineer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        motive: 'Offered 500 BTC by offshore hacking collective for quantum cipher keys.',
        alibi: 'Claims he was off-shift at home in Shoreditch.',
        alibiStatus: 'DISPROVEN',
        riskScore: 88,
        riskLevel: 'HIGH',
        fingerprintMatch: 85,
        dnaMatch: 90,
        cyberFootprint: 'Purchased Geneva precision optical clamps with Monero 2 weeks prior.',
        evidenceLinks: ['ev-ldn-01', 'ev-ldn-02'],
        status: 'PRIME SUSPECT',
        notes: 'Possesses the exact technical knowledge of fiber cabling topology.'
      }
    ],
    witnesses: [
      {
        id: 'wit-ldn-01',
        name: 'Simon Clarke',
        occupation: 'Night Systems Operator',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        credibility: 94,
        relationship: 'Monitoring operations center',
        statement: 'At 04:10, I noticed a 0.2 dB light loss on Trunk 9. I thought it was routine laser degradation until the HSM alarm tripped at 04:15.',
        verificationStatus: 'VERIFIED',
        keyClues: ['Light attenuation on Trunk 9', 'HSM alert at 04:15'],
        interviewHistory: []
      }
    ],
    timeline: [
      {
        id: 'tl-ldn-01',
        time: '03:55 GMT',
        date: '2026-05-21',
        title: 'Bunker Door Access with Cloned FOB',
        description: 'Unauthorized entry using duplicated badge credentials of Director Montgomery.',
        source: 'ACCESS-LOG',
        type: 'MOVEMENT',
        verified: true
      },
      {
        id: 'tl-ldn-02',
        time: '04:12 GMT',
        date: '2026-05-21',
        title: 'Fiber Splice & Exfiltration',
        description: 'Micro-prism tap attached to live fiber trunk; 40,000 keys buffered to memory module.',
        source: 'CYBER-LOG',
        type: 'INCIDENT',
        verified: true
      }
    ],
    cctvFeeds: [
      {
        id: 'cam-ldn-01',
        camCode: 'CAM-01',
        locationName: 'VAULT ENTRANCE CORRIDOR',
        timestamp: '03:55:10 GMT',
        status: 'ONLINE',
        anomalyDetected: true,
        anomalyDescription: 'Individual in cleanroom protective jumpsuit entering with technician tote.',
        playbackDuration: 60,
        anomaliesAtTime: [20],
        clueCaptured: true
      }
    ],
    forensics: [
      {
        id: 'for-ldn-01',
        category: 'CYBER',
        title: 'Fiber Tap Firmware Dump',
        status: 'COMPLETED',
        matchConfidence: 95.0,
        sampleId: 'SMP-CYB-552',
        findings: 'Binary reverse engineering revealed custom extraction script signed with GPG key ID 0x88FE2C.',
        keyConclusions: 'Matches GPG key found on Liam Gallagher personal laptop.',
        examiner: 'Cyber Forensics Unit London',
        dateCompleted: '2026-05-21 12:00 GMT',
        dataPoints: [
          { label: 'Exfiltrated Volume', value: '42.6 GB' },
          { label: 'Cryptographic Protocol', value: 'Kyber-1024' },
          { label: 'Signal Loss Rate', value: '0.18 dB' }
        ]
      }
    ],
    boardNodes: [
      { id: 'bn-ldn-1', type: 'SUSPECT', title: 'Liam Gallagher', subtitle: 'Infrastructure Tech', x: 250, y: 150, refId: 'susp-ldn-01' },
      { id: 'bn-ldn-2', type: 'EVIDENCE', title: 'Fiber Prism Tap', subtitle: 'Rack 09', x: 500, y: 150, refId: 'ev-ldn-01' }
    ],
    boardConnections: [
      { id: 'bc-ldn-1', fromId: 'bn-ldn-1', toId: 'bn-ldn-2', label: 'Hardware tool purchase match' }
    ],
    deductionMetrics: {
      evidenceSynthesisScore: 82,
      timelineCoherence: 90,
      suspectCorrelation: 88,
      solvabilityRating: 90,
      primaryHypothesis: 'Liam Gallagher utilized cloned credentials and an optical micro-tap to intercept sovereign quantum keys from the isolated server vault.',
      contradictionsCount: 0,
      keyFindings: [
        'Hardware tap firmware contains digital signature matching Gallagher development environment.',
        'SDR badge cloner recovered from air vent bears Gallagher fingerprints.'
      ]
    },
    warrantData: {
      eligibleSuspectId: 'susp-ldn-01',
      minimumEvidenceRequired: 2,
      legalCriteria: [
        'Hardware forensics linking optical tap directly to suspect',
        'Physical access breach with fraudulent radio badge emulation'
      ]
    }
  },

  {
    id: 'DEL-2026-0142',
    title: 'THE LAST SIGNAL',
    type: 'MISSING PERSON & ESPIONAGE',
    location: 'TELEMETRY ARRAY STATION, ARAVALLI RIDGE, NEW DELHI',
    incidentDate: '2026-01-14 21:00 IST',
    status: 'COLD CASE',
    priority: 'MEDIUM',
    shortDescription: 'Senior radar and autonomous drone researcher Dr. Aarav Mehta vanished during night calibration. Encrypted satellite communicator found abandoned in mud with frequency jammer residue.',
    fullBriefing: 'Dr. Aarav Mehta was executing a high-altitude autonomous satellite telemetry test at the remote Aravalli observatory. His all-terrain vehicle was found with engine idling, headlights illuminated, and driver door open. His encrypted satellite transceiver was buried under wet silt with antenna snapped.',
    leadInvestigator: 'Det. Pulkit Gupta (DET-7091)',
    progress: 15,
    evidenceCount: 4,
    suspectCount: 2,
    witnessCount: 2,
    lastAccessed: '2026-08-22 16:30',
    themeColor: 'amber',
    crimeScene: {
      name: 'Observatory Ridge Perimeter & Dish Antenna 4',
      environmentDescription: 'Rugged desert ridge with parabolic satellite dish, parked off-road vehicle, heavy mud track impressions, and scrub vegetation.',
      dimensions: '25.0m x 20.0m',
      hotspots: [
        {
          id: 'cs-del-1',
          name: 'Abandoned Satellite Transceiver',
          x: 35,
          y: 65,
          type: 'DIGITAL',
          importance: 'CRITICAL',
          description: 'Military Iridium handset with cracked LCD and snapped antenna.',
          details: 'Last transmitted GPS burst at 21:04 IST with distress alert code 99.',
          discoveredAt: '23:30 IST',
          collected: true,
          inspected: true,
          iconName: 'Radio'
        },
        {
          id: 'cs-del-2',
          name: 'Dual Tire Tread Marks',
          x: 62,
          y: 78,
          type: 'TRACE',
          importance: 'HIGH',
          description: 'Heavy dual-axle all-terrain tire prints diverging toward southern border road.',
          details: 'Tread depth indicates loaded payload over 3 tons.',
          discoveredAt: '23:45 IST',
          collected: false,
          inspected: true,
          iconName: 'Compass'
        }
      ]
    },
    evidenceList: [
      {
        id: 'ev-del-01',
        code: 'EVD-DEL-142-01',
        title: 'Cracked Iridium Distress Communicator',
        category: 'DIGITAL',
        importance: 'CRITICAL',
        locationFound: 'Mud Basin near Dish 4',
        timestamp: '2026-01-14 23:30 IST',
        description: 'Hardened satellite device with distress packet recorded at 21:04 IST.',
        forensicNotes: 'Contains partial coordinates of rendezvous point 18km South.',
        status: 'COLLECTED',
        tags: ['GPS', 'Distress', 'Satellite']
      }
    ],
    suspects: [
      {
        id: 'susp-del-01',
        name: 'Rohan Singhania',
        alias: 'The Broker',
        age: 39,
        occupation: 'Defense Logistics Liaison',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        motive: 'Sought Dr. Mehta proprietary drone autopilot code for foreign defense conglomerate.',
        alibi: 'Claims he was in Gurugram hotel meeting clients.',
        alibiStatus: 'QUESTIONABLE',
        riskScore: 75,
        riskLevel: 'HIGH',
        fingerprintMatch: 60,
        dnaMatch: 45,
        cyberFootprint: 'Satellite phone call logged near observatory tower at 20:55 IST.',
        evidenceLinks: ['ev-del-01'],
        status: 'PRIME SUSPECT',
        notes: 'Vehicle matches tire width recorded at the ridge escape route.'
      }
    ],
    witnesses: [
      {
        id: 'wit-del-01',
        name: 'Rajesh Kumar',
        occupation: 'Observatory Forest Guard',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        credibility: 85,
        relationship: 'Local security ranger',
        statement: 'I saw headlights climbing toward Dish 4 around 20:45. A few minutes later, the generator buzz was cut and a dark pickup sped away with sirens off.',
        verificationStatus: 'VERIFIED',
        keyClues: ['Dark pickup truck without lights', 'Generator cut at 21:00'],
        interviewHistory: []
      }
    ],
    timeline: [
      {
        id: 'tl-del-01',
        time: '20:30 IST',
        date: '2026-01-14',
        title: 'Dr. Mehta Begins Calibration',
        description: 'Observatory logs show dish alignment cycle initiated.',
        source: 'SYSTEM',
        type: 'INCIDENT',
        verified: true
      },
      {
        id: 'tl-del-02',
        time: '21:04 IST',
        date: '2026-01-14',
        title: 'Distress Signal Pulse',
        description: 'Satellite transceiver transmits emergency beacon before being severed.',
        source: 'SATELLITE',
        type: 'COMMUNICATION',
        verified: true
      }
    ],
    cctvFeeds: [
      {
        id: 'cam-del-01',
        camCode: 'CAM-01',
        locationName: 'RIDGE ROAD CHECKPOINT',
        timestamp: '21:12:30 IST',
        status: 'INTERFERENCE',
        anomalyDetected: true,
        anomalyDescription: 'Unmarked truck passing barrier without stopping.',
        playbackDuration: 40,
        anomaliesAtTime: [15],
        clueCaptured: true
      }
    ],
    forensics: [
      {
        id: 'for-del-01',
        category: 'CYBER',
        title: 'Satellite Signal Triangulation',
        status: 'COMPLETED',
        matchConfidence: 89.0,
        sampleId: 'SMP-DEL-RAD-01',
        findings: 'Emergency burst signal was triangulated to coordinates 28.391° N, 77.012° E.',
        keyConclusions: 'Victim was intercepted on the trail and abducted by motorized transport.',
        examiner: 'Space Applications Centre Forensics',
        dateCompleted: '2026-01-15 08:00 IST',
        dataPoints: [
          { label: 'Frequency Band', value: '1626.5 MHz' },
          { label: 'Signal SNR', value: '14.2 dB' },
          { label: 'Azimuth', value: '184.2 deg' }
        ]
      }
    ],
    boardNodes: [
      { id: 'bn-del-1', type: 'SUSPECT', title: 'Rohan Singhania', subtitle: 'Defense Broker', x: 240, y: 150, refId: 'susp-del-01' },
      { id: 'bn-del-2', type: 'EVIDENCE', title: 'Iridium Transceiver', subtitle: 'Distress Pulse', x: 500, y: 150, refId: 'ev-del-01' }
    ],
    boardConnections: [
      { id: 'bc-del-1', fromId: 'bn-del-1', toId: 'bn-del-2', label: 'Cell tower ping proximity' }
    ],
    deductionMetrics: {
      evidenceSynthesisScore: 70,
      timelineCoherence: 85,
      suspectCorrelation: 78,
      solvabilityRating: 75,
      primaryHypothesis: 'Targeted abduction of Dr. Mehta executed by defense contractor syndicate to acquire autonomous navigation algorithms.',
      contradictionsCount: 0,
      keyFindings: [
        'Satellite distress call proves struggle occurred at 21:04 IST.',
        'Singhania burner phone was active in the remote sector during the precise window.'
      ]
    },
    warrantData: {
      eligibleSuspectId: 'susp-del-01',
      minimumEvidenceRequired: 2,
      legalCriteria: [
        'Geolocation corroboration placing suspect at observatory perimeter',
        'Physical tire tread analysis matching suspect vehicle'
      ]
    }
  },

  {
    id: 'TOK-2026-0773',
    title: 'THE BLACK VAULT',
    type: 'CORPORATE ESPIONAGE & CYBERNETICS',
    location: 'SHINJUKU CYBERNETICS R&D COMPLEX, TOKYO, JAPAN',
    incidentDate: '2026-07-28 01:20 JST',
    status: 'RESTRICTED',
    priority: 'CRITICAL',
    shortDescription: 'Next-generation neural bio-processor blueprints and live crystalline memory core extracted from Sub-Level 4 cleanroom during deliberate magnetic pulse event.',
    fullBriefing: 'At 01:20 JST, Shinjuku Cybernetics R&D facility Sub-Level 4 experienced a controlled EMP surge originating inside the emergency backup room. The prototype Gen-5 crystalline bio-processor was extracted from its cryo-suspension chamber. A single drop of synthetic fluorocarbon-based artificial blood was recovered from the glass aperture.',
    leadInvestigator: 'Det. Pulkit Gupta (DET-7091)',
    progress: 10,
    evidenceCount: 4,
    suspectCount: 2,
    witnessCount: 2,
    lastAccessed: '2026-08-22 15:00',
    themeColor: 'red',
    crimeScene: {
      name: 'Sub-Level 4 Cleanroom & Cryo-Pod',
      environmentDescription: 'Ultra-sterile laminar flow cleanroom with glowing blue coolant tanks, laser perimeter, shattered silicon crucible, and emergency override terminal.',
      dimensions: '16.0m x 14.0m',
      hotspots: [
        {
          id: 'cs-tok-1',
          name: 'Synthetic Blood Droplet on Glass',
          x: 48,
          y: 42,
          type: 'BIOLOGICAL',
          importance: 'CRITICAL',
          description: 'Cyan-tinted fluorocarbon polymer fluid with cellular nanite markers.',
          details: 'Used exclusively in experimental cybernetic prosthetics produced by Kurogane Heavy Industries.',
          discoveredAt: '02:15 JST',
          collected: true,
          inspected: true,
          iconName: 'Fingerprint'
        },
        {
          id: 'cs-tok-2',
          name: 'EMP Coaxial Coil Residue',
          x: 74,
          y: 62,
          type: 'PHYSICAL',
          importance: 'HIGH',
          description: 'Melted copper magnetic coil capacitor discharged at 50,000 amperes.',
          details: 'Designed to vaporize nearby camera sensors while keeping low-level flash memory intact.',
          uvOnly: true,
          discoveredAt: '02:40 JST',
          collected: false,
          inspected: true,
          iconName: 'Flame'
        }
      ]
    },
    evidenceList: [
      {
        id: 'ev-tok-01',
        code: 'EVD-TOK-773-01',
        title: 'Cyan Synthetic Fluorocarbon Fluid',
        category: 'BIOLOGICAL',
        importance: 'CRITICAL',
        locationFound: 'Cryo-Pod Glass Plinth',
        timestamp: '2026-07-28 02:15 JST',
        description: 'Micro-sample of synthetic oxygen-carrying blood substitute with nanite serial #K-881.',
        forensicNotes: 'Matches custom cybernetic left arm installed on operative Kenji Sato.',
        status: 'COLLECTED',
        tags: ['Synthetic', 'Nanite', 'Cybernetic']
      }
    ],
    suspects: [
      {
        id: 'susp-tok-01',
        name: 'Kenji Sato',
        alias: 'Ronin',
        age: 38,
        occupation: 'Ex-Special Forces Infiltration Specialist',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        motive: 'Operates as corporate mercenary hired by rival robotics multinational.',
        alibi: 'Claims he was in Roppongi entertainment district.',
        alibiStatus: 'DISPROVEN',
        riskScore: 94,
        riskLevel: 'CRITICAL',
        fingerprintMatch: 90,
        dnaMatch: 95,
        cyberFootprint: 'Prosthetic telemetry logged hydraulic seal breach at 01:19 JST.',
        evidenceLinks: ['ev-tok-01'],
        status: 'PRIME SUSPECT',
        notes: 'Nanite serial on synthetic blood droplet matches his medical implant registry.'
      }
    ],
    witnesses: [
      {
        id: 'wit-tok-01',
        name: 'Dr. Reiko Tanaka',
        occupation: 'Head of Bio-processor Research',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        credibility: 96,
        relationship: 'Lead Scientist',
        statement: 'The thief knew the exact cryogenic pressure equilibrium. If the cryo-pod had warmed by 2 degrees, the crystalline core would have decayed.',
        verificationStatus: 'VERIFIED',
        keyClues: ['Specialized cryogenic handling', 'Knowledge of Gen-5 decay thresholds'],
        interviewHistory: []
      }
    ],
    timeline: [
      {
        id: 'tl-tok-01',
        time: '01:15 JST',
        date: '2026-07-28',
        title: 'EMP Detonation in Sub-Basement',
        description: 'Capacitor discharge blinds local optical sensors for 180 seconds.',
        source: 'SENSOR',
        type: 'INCIDENT',
        verified: true
      },
      {
        id: 'tl-tok-02',
        time: '01:20 JST',
        date: '2026-07-28',
        title: 'Cryo-Core Extraction',
        description: 'Synthetic fluid leaked as suspect severed liquid nitrogen feed line.',
        source: 'FORENSIC',
        type: 'INCIDENT',
        verified: true
      }
    ],
    cctvFeeds: [
      {
        id: 'cam-tok-01',
        camCode: 'CAM-01',
        locationName: 'SUB-LEVEL 4 AIRLOCK',
        timestamp: '01:14:50 JST',
        status: 'INTERFERENCE',
        anomalyDetected: true,
        anomalyDescription: 'EMP flash followed by silhouette in tactical pressurized exo-suit.',
        playbackDuration: 60,
        anomaliesAtTime: [10],
        clueCaptured: true
      }
    ],
    forensics: [
      {
        id: 'for-tok-01',
        category: 'BALLISTICS',
        title: 'Nanite Fluid Chromatography',
        status: 'COMPLETED',
        matchConfidence: 98.6,
        sampleId: 'SMP-TOK-NAN-09',
        findings: 'Nanite serial K-881 is proprietary to Kenji Sato prosthetic reconstructive surgery performed in Kobe 2025.',
        keyConclusions: 'Irrefutable physical link between suspect and cryo-pod glass plinth.',
        examiner: 'Tokyo Metropolitan Police Crime Lab',
        dateCompleted: '2026-07-28 08:30 JST',
        dataPoints: [
          { label: 'Nanite Model', value: 'Kurogane MK-IV' },
          { label: 'Serial Hash', value: '0xK8819A' },
          { label: 'Viscosity Index', value: '4.2 cP' }
        ]
      }
    ],
    boardNodes: [
      { id: 'bn-tok-1', type: 'SUSPECT', title: 'Kenji Sato', subtitle: 'Cyborg Infiltrator', x: 260, y: 150, refId: 'susp-tok-01' },
      { id: 'bn-tok-2', type: 'EVIDENCE', title: 'Nanite Blood Droplet', subtitle: 'Serial K-881', x: 520, y: 150, refId: 'ev-tok-01' }
    ],
    boardConnections: [
      { id: 'bc-tok-1', fromId: 'bn-tok-1', toId: 'bn-tok-2', label: 'Nanite registry match' }
    ],
    deductionMetrics: {
      evidenceSynthesisScore: 85,
      timelineCoherence: 92,
      suspectCorrelation: 94,
      solvabilityRating: 92,
      primaryHypothesis: 'Kenji Sato executed high-precision corporate espionage using an EMP discharge and breached the cryogenic bio-processor containment.',
      contradictionsCount: 0,
      keyFindings: [
        'Synthetic blood nanites contain serial number registered to Kenji Sato prosthetic arm.',
        'EMP timing aligns precisely with camera downtime and nitrogen bypass.'
      ]
    },
    warrantData: {
      eligibleSuspectId: 'susp-tok-01',
      minimumEvidenceRequired: 2,
      legalCriteria: [
        'Biological/synthetic fluid matching suspect unique surgical nanite registry',
        'Physical breach of restricted Level 4 cryogenic cleanroom'
      ]
    }
  }
];
