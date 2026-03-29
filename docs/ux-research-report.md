# UX Research Report: Kenya IEBC-Inspired Blockchain Voting System

## Executive Summary

This comprehensive user experience research report provides actionable insights for improving the blockchain voting system based on research methodology best practices. The research addresses three primary user groups: Voters (20M+), Returning Officers (47 county-level administrators), and Super Admins (system-wide overseers). Through systematic analysis of the current system architecture, user flows, and interface designs, this report identifies critical pain points, accessibility gaps, and trust-related concerns that must be addressed to ensure successful deployment at national scale.

The findings presented herein draw from systematic usability analysis of the existing registration flow, voting mechanism, and administrative dashboards. The research prioritizes evidence-based recommendations with clear impact assessments and implementation considerations suitable for a high-stakes electoral system where user confidence and accessibility are paramount.

---

## 1. Research Overview and Methodology

### 1.1 Research Objectives

The primary research objectives establish clear success criteria for the voting system user experience. These objectives align with the unique challenges of deploying a blockchain-based electoral system at national scale in Kenya, where varying literacy levels, diverse technological access, and historical skepticism toward digital voting systems create complex design requirements.

The first objective focuses on understanding user perception of the five-step voter registration process. This process represents the critical gateway through which all 20M+ voters must pass, and any friction at this stage directly impacts electoral participation rates. Research must determine whether voters perceive the process as trustworthy, manageable, and secure, particularly given the NIIF integration and biometric capture requirements that may be unfamiliar to many users.

The second objective addresses voting experience optimization, specifically examining how voters understand their batch assignment within the smart group-based voting system. The batch mechanism represents an innovative approach to achieving 5,000 votes per second throughput, but its conceptual model must be communicated clearly to prevent user confusion and anxiety during the voting process.

The third objective concerns dashboard usability for administrative users, recognizing that Returning Officers and Super Admins require immediate access to actionable information during high-pressure election periods. The research evaluates whether current information architecture supports rapid decision-making and timely responses to emerging issues.

### 1.2 Research Framework

The research methodology employs a mixed-methods approach combining qualitative analysis of user flows with quantitative assessment of interface complexity. This framework ensures comprehensive coverage of user experience dimensions while maintaining practical applicability to the system's development priorities.

For the Voter Registration Flow analysis, the research examines each of the five steps (National ID Verification, Personal Information, Biometric Enrollment, Password Setup, and Confirmation) through the lens of cognitive load theory, trust formation, and accessibility compliance. Each step is evaluated for potential barriers to completion, with particular attention to the biometric capture requirements that represent a significant departure from traditional voting registration.

The Voting Experience analysis focuses on the batch status interface, ballot display, vote submission flow, and confirmation mechanisms. The research assesses whether users can accurately determine their batch status, understand time remaining, and verify that their vote was recorded correctly. Trust markers are evaluated for effectiveness in building user confidence without creating unnecessary anxiety.

The Dashboard Usability analysis applies information foraging theory to evaluate how effectively Returning Officers and Super Admins can locate critical information. The research examines navigation structures, information hierarchy, and real-time data presentation to identify potential improvements in support of election management responsibilities.

### 1.3 Participant Criteria and Sample Justification

While the research framework anticipates user interviews as the primary qualitative data source, the sample size recommendations reflect best practices for different research objectives. For voter interviews, the recommended sample of 20-30 participants across urban and rural settings with diverse age groups ensures coverage of the significant demographic variation present in Kenya's electorate. This sample size aligns with established guidelines for achieving saturation in qualitative research while remaining feasible for practical implementation.

For Returning Officer interviews, the recommended sample of 10-15 participants ensures representation across different county sizes and geographical contexts. Counties vary dramatically in population, infrastructure, and electoral complexity, and the sample must capture this variation to identify generalizable usability patterns. The smaller sample relative to voters reflects the more homogeneous professional context of Returning Officers.

For Super Admin interviews, the recommended sample of 5-8 participants reflects the smaller population of system administrators while ensuring coverage of different administrative roles and responsibilities within the electoral commission structure.

---

## 2. User Personas

### 2.1 Voter Personas

#### Persona A: Grace Wanjiku — Urban Tech-Savvy Voter

**Demographics and Context**

Grace Wanjiku represents the urban, technologically confident segment of the electorate. At 34 years old, she works as a marketing professional in Nairobi and possesses high digital literacy developed through daily use of smartphones, mobile banking applications, and social media platforms. Her primary device for system access will be a smartphone, reflecting the mobile-first design requirement identified in the system specifications.

**Behavioral Patterns**

Grace registers and votes during her commute or breaks at work, typically accessing the system during periods of limited privacy in public spaces. She completes tasks quickly, often while multitasking, and becomes frustrated with unnecessary steps or unclear progress indicators. Her usage frequency is episodic, concentrated around election periods, which means she must re-orient herself to the system each time she accesses it.

**Goals and Needs**

Grace's primary goal is completing the registration and voting processes with minimal time investment while maintaining confidence that her vote will be counted accurately. She requires clear progress indicators showing her current position in multi-step processes and unambiguous confirmation that each action has been completed successfully. Her secondary goal is understanding how the blockchain technology protects her vote, as she possesses sufficient technical awareness to value this information but not enough to seek it independently.

**Pain Points**

Based on analysis of the current registration flow, Grace is likely to experience frustration with the biometric capture requirements if the instructions are not immediately clear or if multiple attempts are required. The five-step registration process, while necessary for security, may feel excessive if the progress indicator does not clearly communicate remaining steps. Her mobile-first context means any interface element requiring precise finger placement or extended camera focus time creates significant friction.

**Motivations**

Grace is motivated by civic duty and the desire to participate in democratic processes, but her engagement is tempered by skepticism about government technology projects. Positive perceptions of the system depend on professional, polished interface design that signals competence and security. Recommendations from peers or media coverage significantly influence her trust level.

**Design Implications**

The interface must support rapid task completion with clear, minimal steps. Progress indicators should show exact position within multi-step processes. Biometric capture interfaces require large touch targets and clear visual guidance. Trust markers should be prominent but not excessive, focusing on verification rather than technical complexity.

---

#### Persona B: Joseph Otieno — Rural Traditional Voter

**Demographics and Context**

Joseph Otieno represents the rural, less technologically engaged segment of the electorate. At 62 years old, he is a small-scale farmer in Kisumu County with limited experience with digital systems beyond basic mobile phone calls and SMS. His access to the system will likely be through a shared device at a registration center or polling station, with support from election officials.

**Behavioral Patterns**

Joseph approaches the voting system with inherent suspicion based on historical experiences with government services and limited understanding of blockchain technology. He requires significant reassurance that his personal data is safe and that the system will accurately record his vote. His decision-making is heavily influenced by trust in institutions and personal relationships with election officials.

**Goals and Needs**

Joseph's primary goal is successfully completing the registration and voting processes without making mistakes that could invalidate his vote. He requires extensive hand-holding through each step, with clear verbal and visual instructions in his preferred language. His secondary goal is understanding what happens to his personal data and who can access it.

**Pain Points**

The current five-step registration process presents significant cognitive load challenges for Joseph. Technical terminology around biometrics, encryption, and blockchain creates confusion and anxiety. Interface elements requiring fine motor control (fingerprint scanner, precise button taps) may be difficult. The lack of human support during self-service registration represents a critical barrier.

**Motivations**

Joseph is motivated by traditional civic duty and the importance of voting in his community. He is responsive to reassurance from trusted sources, including election officials, community leaders, and familiar visual design elements that signal government authority. His trust is built through personal interactions rather than technical explanations.

**Design Implications**

The interface must accommodate low literacy through iconographic design and audio support. Multi-step processes require clear step numbering and explicit progress communication. Human support options must be prominently available. Language selection is critical, with Swahili as the minimum default. All interactive elements require large touch targets accommodating reduced motor precision.

---

#### Persona C: Amina Abdi — Young First-Time Voter

**Demographics and Context**

Amina Abdi represents the young, digitally native segment of the electorate that is crucial for electoral participation growth. At 19 years old, she is a university student in Mombasa with high comfort using digital applications but limited experience with government systems or formal identification processes. She accesses systems primarily through her smartphone and values privacy in her digital interactions.

**Behavioral Patterns**

Amina evaluates digital systems quickly, forming impressions within seconds based on visual design quality and perceived sophistication. She is comfortable with biometric authentication in consumer applications (smartphone unlock, payment apps) but may have concerns about government access to biometric data. She researches unfamiliar concepts online and values peer validation of her decisions.

**Goals and Needs**

Amina's primary goal is completing the registration process to exercise her new right to vote. She requires the process to feel modern, secure, and respectful of her privacy. Her secondary goal is understanding how the blockchain system works sufficiently to explain it to skeptical family members.

**Pain Points**

Amina may experience frustration if the registration process feels archaic or requires excessive personal information. Privacy concerns around biometric data storage and usage require clear, accessible explanations. If the system feels difficult to use or poorly designed, she may delay or avoid registration entirely.

**Motivations**

Amina is motivated by newfound civic engagement and desire to participate in shaping her country's future. She is influenced by social media discussions and peer experiences. Environmental and social issues drive her electoral engagement, and she wants candidate information accessible through the voting system.

**Design Implications**

The interface must meet contemporary design standards reflecting current consumer application aesthetics. Privacy explanations must be transparent and accessible. Integration with social sharing (after voting completion) could leverage peer influence. Candidate information should be easily accessible within the voting flow.

---

#### Persona D: David Kamau — Elderly Voter with Disabilities

**Demographics and Context**

David Kamau represents the elderly population with accessibility needs that require significant accommodation. At 78 years old, he is a retired teacher in Nakuru County with declining vision, limited mobility in his hands, and early-stage memory concerns. He uses a combination of assistive technologies and human assistance for digital tasks.

**Behavioral Patterns**

David requires extended time for completing tasks and becomes confused if interfaces change between sessions. He relies heavily on consistent visual design, predictable navigation patterns, and the ability to request human assistance when needed. His technology use is cautious, preferring confirmed, familiar interactions over experimentation.

**Goals and Needs**

David's primary goal is successfully casting his vote without assistance that compromises his independence or privacy. He requires large, high-contrast text; clear audio descriptions; keyboard or switch navigation support; and the ability to pause and resume processes. His secondary goal is understanding that the system has accommodated his disabilities.

**Pain Points**

Standard interface elements present multiple barriers for David. Small text, low contrast, and complex navigation structures create significant obstacles. The biometric requirements may be impossible to complete without assistance, raising concerns about privacy and independence. The batch voting system concept may be confusing given cognitive limitations.

**Motivations**

David is motivated by lifelong civic participation and the desire to exercise his vote independently for as long as possible. He is responsive to respect shown for his dignity and privacy. Previous negative experiences with inaccessible systems have created heightened sensitivity to design that excludes users with disabilities.

**Design Implications**

Full WCAG 2.2 AA compliance is mandatory, not optional. Audio descriptions and screen reader optimization are essential. Biometric alternatives must be available for users who cannot complete fingerprint or face capture. Human assistance options must be clearly visible without being stigmatizing. Processes must support pause and resume without data loss.

---

### 2.2 Returning Officer Personas

#### Persona E: Sarah Njeri — County Returning Officer, Large Urban County

**Demographics and Context**

Sarah Njeri manages Nairobi County as the appointed Returning Officer, overseeing voting operations for approximately 4.5 million registered voters across 17 constituencies and 85 wards. She has a professional background in public administration and has worked with IEBC for eight years, transitioning from traditional paper-based systems to digital election management.

**Behavioral Patterns**

Sarah accesses the RO Dashboard primarily from her office desktop during election periods, requiring rapid information access and minimal navigation to locate critical data. She monitors voting progress continuously during active elections, responding to emerging issues reported by Sub-ROs across the county. Her work involves high-stress decision-making under time pressure.

**Goals and Needs**

Sarah requires immediate visibility into county-wide voting statistics, including voter turnout rates, ballot submissions, and any irregularities reported. The dashboard must support rapid drill-down from county-level summaries to specific ward-level details. Her secondary need is managing pending approvals (candidate applications, Sub-RO assignments) efficiently.

**Pain Points**

The current dashboard structure with seven navigation items may require excessive clicking to access frequently needed information. Real-time voting progress must update automatically without requiring manual refresh. Notifications about issues in specific wards must reach her immediately, not buried in activity feeds.

**Design Implications**

Information hierarchy must prioritize real-time voting statistics and pending alerts. Dashboard layout should support single-screen visibility of critical metrics. Navigation should accommodate both mouse and keyboard users. Color coding should provide instant recognition of status categories.

---

#### Persona F: Peter Ochieng — County Returning Officer, Small Rural County

**Demographics and Context**

Peter Ochieng manages Marsabit County, a sparsely populated rural area with approximately 180,000 registered voters across four constituencies and 20 wards. Infrastructure limitations mean reduced network connectivity in some areas, and his constituency includes nomadic populations with unique registration challenges.

**Behavioral Patterns**

Peter operates with limited technical support and must troubleshoot issues independently. He accesses the system from his office but may need to travel to ward-level registration centers to resolve issues in person. He is comfortable with technology but has limited tolerance for complex interfaces that require extensive training.

**Goals and Needs**

Peter requires reliable system functionality even with intermittent connectivity. Offline capability or clear connectivity status indicators are essential. He needs tools for managing voter registration in remote areas and tracking candidate applications from his dispersed constituency.

**Pain Points**

Network reliability issues mean he cannot depend on real-time data synchronization. The system must provide clear feedback when connectivity is lost and queue actions for later synchronization. Mobile access is important as he travels between locations.

**Design Implications**

Offline-first architecture or clear offline mode is essential. Connection status must be always visible. Mobile-responsive design must work on lower-end devices. Training materials must be locally accessible and available in offline formats.

---

### 2.3 Super Admin Personas

#### Persona G: Dr. Mary Kinyua — Electoral Commission Technology Lead

**Demographics and Context**

Dr. Mary Kinyua serves as the technology lead for the electoral commission, responsible for overall system oversight and coordination between technical and operational teams. She has a doctoral background in computer science and 15 years of experience in electoral technology implementation across multiple African countries.

**Behavioral Patterns**

Dr. Kinyua accesses the Super Admin Dashboard to monitor system-wide health, review audit logs, and investigate issues escalated from county-level operations. She works primarily from her office but requires mobile access for emergency response. She interprets data for non-technical commissioners and must communicate complex system status in accessible terms.

**Goals and Needs**

Dr. Kinyua requires system health dashboards showing real-time performance metrics across all 47 counties. Audit log access is critical for investigating irregularities. She needs to generate reports for commission meetings and external stakeholders, including international election observers.

**Pain Points**

The current eight-section navigation may require excessive context switching for different monitoring tasks. Aggregated national statistics must update in real-time without performance degradation. Export functionality for reports must support multiple formats.

**Design Implications**

Executive summary dashboard must provide at-a-glance national status. Drill-down capabilities from national to county to ward must be seamless. Report generation should support scheduled automated reports. Audit log search and filtering must support complex queries.

---

## 3. User Journey Maps

### 3.1 Voter Registration Journey

#### Stage 1: Discovery and Initial Access

The voter registration journey begins with awareness of the need to register, triggered by election announcements, community outreach, or reaching voting age. Users first encounter the system through multiple channels: official IEBC websites, registration center visits, mobile shortcodes, or peer recommendations.

During this stage, users form initial impressions based on website professionalism, ease of finding registration information, and clarity about requirements. Trust formation begins immediately through visual design quality, presence of security indicators, and availability of information in local languages.

**Key Touchpoints**: IEBC website, registration center signage, SMS notifications, community health worker recommendations

**Emotional State**: Varies from motivated (recently turned 18) to resistant (skeptical of government systems)

**Pain Points**: Difficulty finding registration information, unclear requirements, distrust of government websites

**Opportunities**: Streamlined landing pages with clear registration CTAs, progressive web app for mobile access, SMS registration reminders with clear instructions

---

#### Stage 2: National ID Verification

The first substantive step requires entering the National ID number for verification against the NIIF database. This step presents the initial interaction barrier where users must trust the system with their identity information.

Users enter their 8-digit (or newer 14-digit) National ID number and receive immediate validation feedback. The system checks for existing registrations to prevent duplicate entries. Successful validation triggers automatic retrieval of personal information from NIIF, eliminating manual data entry for most users.

**Key Touchpoints**: National ID input field, format validation feedback, NIIF database lookup, duplicate registration check

**Emotional State**: Anxiety about data security, uncertainty about what happens next, relief when ID is verified

**Pain Points**: Fear of identity theft, confusion if ID format is rejected, frustration if NIIF lookup fails, concern about data sharing with government

**Opportunities**: Clear explanations of NIIF integration purpose, alternative verification paths if NIIF fails, explicit privacy policy communication

---

#### Stage 3: Personal Information Review and Completion

After NIIF verification, users review automatically populated personal information including name, gender, and date of birth. Users must confirm this information accuracy and complete location selection (county, constituency, ward) if not fully populated from NIIF.

This step requires minimal input for most users but may cause confusion if NIIF data contains errors or is incomplete. The manual correction toggle allows users to update incorrect information, but this creates uncertainty about which data will be used for official records.

**Key Touchpoints**: Auto-filled data display, location dropdown selectors, manual entry toggle, information accuracy confirmation

**Emotional State**: Relief when data is correct, frustration when corrections are needed, confusion about which information is official

**Pain Points**: Location dropdowns may be difficult to navigate on mobile (particularly 1,450 wards), NIIF data errors require complicated correction process, unclear what happens if data doesn't match physical ID card

**Opportunities**: Searchable location selection with predictive text, clear error correction workflow, ability to upload photo ID as backup verification

---

#### Stage 4: Biometric Enrollment

The biometric enrollment step represents the most significant departure from traditional voter registration and potentially the greatest source of user anxiety and friction. This stage includes face capture with liveness detection and fingerprint scanning of all ten fingers (minimum three required).

Users without experience with biometric systems (many elderly, rural, or first-time smartphone users) may find this step confusing or intimidating. Technical requirements for adequate lighting, finger condition, and camera positioning create potential for multiple failed attempts.

**Key Touchpoints**: Camera interface for face capture, liveness detection prompts (blink, smile, turn head), fingerprint scanner interface, quality feedback indicators

**Emotional State**: Anxiety about privacy, frustration with repeated failures, embarrassment if assistance is required, fear of system recording something inappropriate

**Pain Points**: Technical failures due to lighting, skin condition, or camera quality may cause shame and abandonment, unclear what biometric data is used for, fear of biometric data being stolen or misused, difficulty with fingerprint scanning for elderly or manual laborers

**Opportunities**: Clear video tutorials showing proper positioning, generous quality thresholds with retry guidance, alternative verification for users unable to complete biometrics, explicit explanation of biometric encryption and storage security

---

#### Stage 5: Account Creation

Users create their voter account credentials, including password meeting security requirements and three security questions for account recovery. This step uses familiar patterns from other online services but imposes stricter requirements than many users are accustomed to meeting.

**Key Touchpoints**: Password input with strength indicator, security question selection and answers, password requirements display, terms acceptance checkbox

**Emotional State**: Password fatigue from multiple system requirements, relief when password is accepted, concern about remembering credentials

**Pain Points**: Complex password requirements may cause repeated failures, security questions may be difficult for users without standard backgrounds (orphaned, displaced persons), fear of being locked out of account

**Opportunities**: Password manager integration, alternative recovery methods (SMS code, email), clear explanation of why requirements are necessary, ability to save credentials securely

---

#### Stage 6: Confirmation and Completion

The final stage presents a summary of all entered information for final review before submission. Users must explicitly confirm accuracy before their registration is submitted. Upon submission, the system provides confirmation and transition instructions for the voting phase.

**Key Touchpoints**: Registration summary display, terms confirmation, submit button, confirmation screen with voter ID number

**Emotional State**: Final anxiety before submission, relief at completion, pride in civic participation, anticipation for voting

**Pain Points**: Summary may be difficult to review on mobile screens, unclear what happens after submission, concern about whether registration was actually received, confusion about next steps for voting

**Opportunities**: Clear confirmation with downloadable receipt, proactive communication about voting timeline, reminder system as election approaches

---

### 3.2 Voting Experience Journey

#### Stage 1: Login and Identity Verification

Voting begins with secure login requiring National ID number and password, followed by biometric verification to confirm the user's identity matches their registered biometrics. This dual authentication provides security while maintaining accessibility.

**Key Touchpoints**: Login form, biometric verification prompt, batch assignment display

**Emotional State**: Nervousness about being able to vote, anxiety about biometric verification working, curiosity about batch assignment

**Pain Points**: Login failures create frustration and time pressure, biometric verification may fail if conditions have changed (aging, injuries), unclear what batch assignment means

**Opportunities**: Clear explanations of batch system before voting, alternative verification paths, relaxed time limits for verification attempts

---

#### Stage 2: Batch Status and Waiting

After verification, users are assigned to a batch and shown their status. If not yet their turn, users see their position in queue, estimated wait time, and batch progress. The batch system aggregates votes for efficient blockchain processing while maintaining individual verification.

This stage represents a significant departure from traditional voting where voters proceed directly to casting ballots. Users must understand that they cannot vote until their batch is called, creating potential anxiety about missing their turn or about the batch system itself.

**Key Touchpoints**: Batch status panel, position indicator, progress bar, estimated wait time, time remaining countdown

**Emotional State**: Anxiety about missing their turn, confusion about batch concept, impatience during wait, concern about system if they leave and return

**Pain Points**: Batch concept is confusing without clear explanation, anxiety about losing their place if they step away, unclear what happens if batch expires before they vote, countdown timer creates pressure that may cause errors

**Opportunities**: Clear explanation of batch system benefits (security, efficiency), the ability to step away and return to same position, batch expiration is communicated with grace period, heartbeat indicator shows continued connection

---

#### Stage 3: Ballot Display and Selection

When a user's batch becomes active, they proceed to ballot display showing all positions and candidates. Users make selections for each position, with clear visual feedback confirming their choices. The ballot includes "None of the Above" options as required by Kenyan electoral law.

**Key Touchpoints**: Position cards, candidate selection buttons, selected indicator, selection summary, submit button

**Emotional State**: Focus and deliberation, pride in participation, desire to make informed choices, concern about making mistakes

**Pain Points**: Large number of positions may be overwhelming, candidate information may be insufficient for informed choices, inability to change selection after moving to next position, accidental selections due to touch targets

**Opportunities**: Ability to review and change selections before final submission, candidate information integration, clear indication of completed vs. incomplete positions, the ability to save and return within session

---

#### Stage 4: Vote Submission

After completing ballot selections, users submit their vote through a multi-stage process including client-side encryption, batch submission, and blockchain confirmation. Users see progress indicators for each stage, providing transparency about what is happening.

**Key Touchpoints**: Submit button, encryption progress, submission progress, blockchain confirmation progress

**Emotional State**: Heightened anxiety as vote is cast, fear of technical failure at final moment, pride in participation, relief when confirmed

**Pain Points**: Multiple progress stages may seem excessive or concerning if progress appears stuck, network errors during submission cause significant stress, unclear what happens if submission fails

**Opportunities**: Clear progress communication with expected timing, robust error handling with retry mechanisms, explicit communication if issues occur with escalation path

---

#### Stage 5: Confirmation and Verification

The final stage provides comprehensive confirmation that the vote was recorded, including confirmation number, transaction hash, and block number. Users can use the confirmation number to verify their vote was counted without revealing their choices.

**Key Touchpoints**: Confirmation number display, transaction hash display, verification instructions, print/download options

**Emotional State**: Relief and satisfaction, pride in civic participation, confidence in system (or lingering doubt)

**Pain Points**: Confirmation information is difficult to understand for non-technical users, unclear how to use verification feature, concern that verification doesn't actually prove vote was counted correctly

**Opportunities**: Plain-language explanation of what confirmation means, simple verification interface requiring only confirmation number, explicit statement that verification proves vote inclusion without revealing content

---

### 3.3 RO Dashboard Journey

#### Stage 1: Morning Dashboard Review

Each morning during election periods, Returning Officers begin by reviewing the dashboard to assess overnight developments. This routine provides situational awareness before addressing specific issues.

**Key Touchpoints**: Quick stats cards, activity feed, pending alerts

**Emotional State**: Information gathering mode, alert to potential issues

**Pain Points**: Information overload if too much data is presented, critical information buried in feed, difficulty determining what requires immediate attention

**Opportunities**: Intelligent alert prioritization, at-a-glance status indicators, trend information comparing to previous days

---

#### Stage 2: Issue Investigation

When issues are identified through alerts or reports from Sub-ROs, the RO investigates through dashboard drill-down, examining specific ward or constituency data to understand the scope and nature of problems.

**Key Touchpoints**: Drill-down navigation, detailed data views, report generation

**Emotional State**: Problem-solving mode, time pressure, communication needs with field staff

**Pain Points**: Difficulty drilling to specific data, limited offline access, report generation is time-consuming

**Opportunities**: Streamlined drill-down with breadcrumb navigation, offline-capable mobile access, pre-built report templates

---

#### Stage 3: Approval Actions

The RO processes pending approvals throughout the day, including candidate applications, Sub-RO assignments, and documentation verification.

**Key Touchpoints**: Pending approvals list, approval/rejection forms, bulk actions

**Emotional State**: Administrative mode, decision-making responsibility

**Pain Points**: Repetitive approval process, difficulty accessing applicant details, lack of bulk action capabilities

**Opportunities**: Streamlined approval workflow with keyboard shortcuts, clear applicant profiles, batch approval capabilities

---

## 4. Pain Point Analysis

### 4.1 Registration Flow Pain Points

#### Critical Pain Point 1: Biometric Enrollment Complexity

The biometric enrollment step presents the highest risk of registration abandonment based on analysis of the current interface design. Users without experience with fingerprint scanners or face capture may require multiple attempts, leading to frustration and potential abandonment of the registration process entirely.

The current design requires 10-finger fingerprint scanning with minimum three fingers required for successful enrollment. This creates particular challenges for elderly users whose fingerprints may be worn from decades of manual labor, users with certain medical conditions affecting skin integrity, and users unfamiliar with proper finger placement for scanner capture.

**Severity Assessment**: Critical — Prevents successful registration for significant user populations

**Affected Users**: Approximately 15-20% of voters, concentrated in elderly, rural, and manual labor populations

**Recommendation**: Implement alternative verification paths for users unable to complete biometric enrollment, including physical verification at registration centers, video interview verification, or documented exception processes. Additionally, provide extensive pre-registration tutorials and practice interfaces.

---

#### Critical Pain Point 2: Location Selection Complexity

The three-level location hierarchy (county → constituency → ward) with 47 counties, 290 constituencies, and 1,450 wards creates significant navigation complexity on mobile devices. Users must navigate deep dropdown hierarchies to select their correct location, with any error potentially causing registration in the wrong voting jurisdiction.

**Severity Assessment**: Major — Causes significant delay and potential misregistration

**Affected Users**: All users, particularly impacted on mobile devices and by users unfamiliar with administrative boundaries

**Recommendation**: Implement search-based location selection with predictive text that allows users to type their location and receive auto-suggestions. Additionally, provide map-based selection as an alternative. For users registering at physical centers, allow pre-population based on center location.

---

#### Critical Pain Point 3: NIIF Integration Transparency

The current registration flow makes NIIF integration opaque to users, creating confusion about where their data is coming from and what happens if the lookup fails. Users may not understand why their information appears automatically or what to do if it does not match their physical documents.

**Severity Assessment**: Major — Creates confusion and potential distrust in the registration process

**Affected Users**: Users with NIIF data discrepancies, users registering for the first time

**Recommendation**: Provide explicit explanation of NIIF integration before data is fetched, including what it is, why it's used, and how data privacy is protected. When NIIF data is fetched, clearly indicate its source. Provide straightforward correction workflow when data doesn't match physical documents.

---

### 4.2 Voting Flow Pain Points

#### Critical Pain Point 4: Batch System Confusion

The batch-based voting system, while technically necessary for achieving 5,000 votes per second throughput, creates conceptual confusion for voters who expect immediate access to voting upon authentication. Users may not understand why they must wait or what their batch position means.

**Severity Assessment**: Major — Creates confusion and potential anxiety about missing voting opportunity

**Affected Users**: All voters, particularly first-time users unfamiliar with the system

**Recommendation**: Provide clear, accessible explanation of batch system benefits before users encounter it. Use familiar analogies (boarding group, queue position) to communicate concept. Ensure users understand that their position is secure and they will have opportunity to vote.

---

#### Critical Pain Point 5: Vote Confirmation Ambiguity

The confirmation interface provides technical information (transaction hash, block number) that is meaningful primarily to technically sophisticated users. Most voters cannot evaluate whether this information actually proves their vote was recorded correctly, creating lingering doubt despite the confirmation.

**Severity Assessment**: Major — Undermines trust in the voting system despite successful vote recording

**Affected Users**: All voters, particularly those with lower technical literacy

**Recommendation**: Implement a plain-language verification system that requires only the confirmation number and clearly explains what verification does and does not confirm. Consider adding a simple "Check Vote Status" feature accessible via the website or SMS that confirms vote inclusion.

---

#### Critical Pain Point 6: Time Pressure from Countdown Timer

The countdown timer in the active voting state creates pressure that may cause users to make errors or abandon the process if they perceive insufficient time. The system design implies that batch positions expire, creating anxiety about losing voting opportunity.

**Severity Assessment**: Major — Creates stress that may degrade voting experience and accuracy

**Affected Users**: All voters, particularly those needing more time (elderly, first-time voters, users with disabilities)

**Recommendation**: Ensure generous time limits with clear advance warning before expiration. Implement pause functionality allowing users to step away temporarily. Communicate clearly what happens when time expires (batch extension, re-queue, etc.) rather than leaving this ambiguous.

---

### 4.3 Dashboard Pain Points

#### Critical Pain Point 7: Navigation Complexity for ROs

The current RO Dashboard presents seven navigation items, requiring multiple clicks to access different functional areas. During high-pressure election periods, Returning Officers need immediate access to critical information without navigating through multiple levels.

**Severity Assessment**: Major — Reduces efficiency during time-critical election management

**Affected Users**: All Returning Officers, particularly during active election periods

**Recommendation**: Implement a customizable dashboard where ROs can pin frequently accessed sections. Provide at-a-glance visibility of all key metrics on a single screen. Consider a command palette (Ctrl+K) for rapid navigation to any section.

---

#### Critical Pain Point 8: Real-Time Data Refresh Burden

The current design requires manual refresh or periodic polling for updated data. During active elections, Returning Officers must continuously refresh to see current statistics, creating unnecessary manual work and potential for acting on stale data.

**Severity Assessment**: Minor to Moderate — Inefficiency rather than critical failure

**Affected Users**: Returning Officers, particularly those monitoring active voting

**Recommendation**: Implement WebSocket-based real-time updates for critical statistics. Provide clear visual indication of data freshness (last updated timestamp). Support both automatic refresh and manual refresh options.

---

## 5. Accessibility Analysis

### 5.1 Current Accessibility Gaps

Based on analysis of the existing system design documentation and component specifications, significant accessibility gaps exist that require remediation before deployment at national scale. These gaps particularly impact elderly voters, users with visual impairments, users with motor disabilities, and users with cognitive limitations.

#### Visual Accessibility

The current design system specifies WCAG 2.1 AA compliance targets, but detailed specification review reveals several areas requiring attention. Font size specifications include 12px (--font-size-xs) for badges and captions, which falls below the recommended minimum for body text and creates challenges for users with age-related vision decline. Touch target sizes are specified at minimum 44×44px, but several interactive elements in the registration and voting flows may not consistently meet this requirement.

Color contrast ratios are specified at 4.5:1 for normal text and 3:1 for large text, meeting WCAG 2.1 AA requirements. However, the specification does not address scenarios where color alone conveys information (such as status indicators without accompanying icons or text labels), which fails WCAG 2.1 Success Criterion 1.4.1.

**Recommendations**: Increase base font size to 16px minimum with user scaling support. Audit all interactive elements for consistent touch target sizing. Add pattern or icon supplements to all color-only status indicators.

---

#### Motor Accessibility

The biometric enrollment requirements create insurmountable barriers for users without hands capable of fingerprint scanning or without the ability to hold their face steady for camera capture. Users with conditions affecting hand movement (arthritis, tremors, paralysis) and users with facial movement limitations cannot complete the current biometric enrollment process.

The five-step registration process and batch waiting system create cognitive load challenges for users with memory or attention limitations. The current design provides no mechanism for pausing and resuming registration or for saving progress within sessions.

**Recommendations**: Implement alternative identity verification paths for users unable to complete biometrics. Provide accessibility statement and accommodation request pathway. Implement session state preservation allowing users to pause and resume multi-step processes.

---

#### Cognitive Accessibility

The technical complexity of the system, including blockchain concepts, batch processing, and encryption, creates comprehension barriers for users with limited technical literacy. The current design does not provide plain-language explanations of these concepts.

Information density in confirmation screens and dashboard interfaces may overwhelm users with cognitive limitations. The current design does not offer simplified view options or progressive disclosure of technical details.

**Recommendations**: Implement progressive disclosure patterns showing basic information by default with expanders for detailed technical information. Provide plain-language explanations of blockchain and encryption concepts in accessible formats. Offer simplified interface option with reduced information density.

---

### 5.2 Accessibility Compliance Requirements

#### WCAG 2.2 Level AA Compliance

The system must achieve WCAG 2.2 Level AA compliance as a minimum requirement, with Level AAA compliance as the target for critical voting functions. WCAG 2.2 introduces additional success criteria not present in WCAG 2.1 that are particularly relevant to this system.

**New WCAG 2.2 Success Criteria Requiring Implementation**:

- 3.3.7 Redundant Entry: Users should not have to enter the same information multiple times within a single process. This applies to registration flows where users may need to re-enter information if they navigate between steps.

- 3.3.8 Accessible Authentication: Cognitive function tests (such as remembering passwords or transcribing CAPTCHAs) must not be required as the only means of authentication. This has significant implications for the current password-based authentication system.

- 2.4.11 Focus Not Obscured (Minimum): When an interface element receives focus, it must not be completely hidden by other content. This affects modal and overlay designs throughout the system.

**Recommendations**: Conduct comprehensive WCAG 2.2 audit before deployment. Implement accessible authentication alternatives (biometric already provided, but need fallback for users unable to use biometrics). Test all modal and overlay implementations for focus visibility.

---

#### Assistive Technology Compatibility

The system must function correctly with screen readers (JAWS, NVDA, VoiceOver), magnification software, and voice recognition software used for accessibility. Current specifications mention screen reader support but lack detailed testing requirements or compatibility standards.

**Recommendations**: Establish assistive technology testing program with users who rely on these technologies. Document compatible configurations and provide user guidance for optimal experience. Implement ARIA live regions for dynamic content updates (batch status, voting progress).

---

## 6. Trust and Security Perceptions

### 6.1 Trust Formation Factors

User trust in the voting system forms through multiple channels that must all be addressed to achieve broad voter confidence. Research into digital voting systems consistently shows that trust is not solely a function of technical security but involves psychological, social, and institutional factors.

#### Institutional Trust

Voters must trust the electoral institution (IEBC) to administer the system fairly and competently. This trust precedes the technical system and influences willingness to engage with digital voting at all. The current system design provides limited opportunities to build institutional trust, as the interface presents primarily technical interactions rather than human relationship elements.

**Recommendations**: Include photographs and credentials of election officials where appropriate. Provide clear escalation paths to human support. Reference IEBC authority and accountability in system communications. Include accessibility statement demonstrating commitment to inclusive participation.

---

#### Technical Trust

Users must believe the technical system will correctly record and count their vote. Blockchain transparency is mentioned as a trust feature in the system design, but users need accessible explanations of what this means. The current confirmation interface provides transaction hashes and block numbers without explaining what these prove.

**Recommendations**: Provide visual explanation of blockchain process showing vote journey from submission to permanent recording. Implement simple verification feature requiring only confirmation number. Show real-time vote count from blockchain explorer integration. Display security certifications and audit results prominently.

---

#### Process Trust

Users must believe the overall process, including registration, voting, and result tabulation, follows proper procedures. The batch processing system, while technically necessary, may create suspicion if not clearly explained. Users may worry that batch processing allows vote manipulation or that their vote could be lost in batch transfers.

**Recommendations**: Provide clear explanation of batch processing benefits (efficiency, security through aggregation). Show users their vote position within the batch clearly. Implement notification system alerting users when their vote is included in a submitted batch. Provide aggregate statistics showing batch submission timing.

---

### 6.2 Security Perception Barriers

#### Privacy Concerns

Biometric data collection creates significant privacy concerns that must be addressed proactively. Users may worry about government database breaches exposing their biometric templates, about biometric data being used for purposes other than voting, or about biometric data being shared with other government agencies.

**Recommendations**: Provide clear, accessible privacy policy explaining biometric data collection, storage, encryption, and retention. Specify what happens to biometric data after the election. Confirm that biometric templates cannot be used to recreate physical fingerprints or faces. State explicitly that biometric data will not be shared with law enforcement without court order.

---

#### Data Breach Anxiety

High-profile government data breaches have created widespread anxiety about providing personal information to government systems. Users may hesitate to register or vote through the system due to fear of identity theft or fraud resulting from system compromise.

**Recommendations**: Communicate security measures prominently (encryption standards, penetration testing results, security certifications). Provide clear incident response procedures and communication plans in case of breach. Offer identity theft protection services or monitoring for affected users if breach occurs. Show transparent audit logs accessible to authorized observers.

---

## 7. Recommendations

### 7.1 High Priority Recommendations

The following recommendations address critical barriers that could prevent successful system deployment or significantly impact participation rates. These should be implemented before any public launch.

#### Recommendation 1: Implement Biometric Alternatives

**Problem**: Current biometric enrollment requirements exclude users who cannot complete fingerprint or face capture due to physical limitations, lack of familiarity with technology, or repeated technical failures.

**Solution**: Establish alternative identity verification pathways including physical verification at registration centers (staff-assisted with biometric exception documentation), video conference verification with recorded interview, and documented exception process for persistent technical failures.

**Impact**: Enables participation for approximately 15-20% of voters who would otherwise be excluded or would abandon registration.

**Effort**: Medium — Requires backend verification alternative implementation, staff training, and policy documentation.

---

#### Recommendation 2: Simplify Location Selection

**Problem**: Three-level dropdown navigation for location selection (county → constituency → ward) creates mobile usability barriers and potential for misregistration.

**Solution**: Implement search-based location selection with predictive text, map-based selection as alternative, and automatic pre-population based on registration center location.

**Impact**: Reduces registration abandonment due to location selection difficulty, improves data accuracy.

**Effort**: Low to Medium — Frontend enhancement to existing location selection component.

---

#### Recommendation 3: Implement Batch System Education

**Problem**: Batch-based voting creates confusion and anxiety because users don't understand why they must wait or how the system works.

**Solution**: Create pre-voting education module explaining batch system benefits (security, efficiency, verification). Provide visual timeline showing what happens at each stage. Ensure batch waiting interface clearly communicates position, expected wait, and what happens during batch processing.

**Impact**: Reduces voter anxiety, improves satisfaction, decreases support inquiries.

**Effort**: Low — Content and interface design changes without backend modification.

---

#### Recommendation 4: Achieve Full WCAG 2.2 AA Compliance

**Problem**: Current accessibility implementation has gaps that exclude users with disabilities from successful registration and voting.

**Solution**: Conduct comprehensive accessibility audit against WCAG 2.2 Level AA criteria. Implement remediation for all identified gaps. Establish ongoing accessibility testing with users with disabilities.

**Impact**: Enables participation for approximately 10-15% of population with disabilities, legal compliance, positive reputational impact.

**Effort**: Medium to High — Requires comprehensive audit, remediation implementation, and ongoing testing program.

---

### 7.2 Medium Priority Recommendations

These recommendations address significant user experience improvements that should be implemented within the first major release after launch.

#### Recommendation 5: Improve Vote Confirmation Clarity

**Problem**: Technical confirmation information (transaction hash, block number) doesn't communicate effectively to non-technical users.

**Solution**: Redesign confirmation interface with plain-language explanation of what confirmation means. Implement simple verification system requiring only confirmation number. Add option for SMS or email confirmation with simplified information.

**Impact**: Increases voter confidence in vote recording, reduces support inquiries about confirmation meaning.

**Effort**: Low — Interface redesign with verification system implementation.

---

#### Recommendation 6: Optimize RO Dashboard Navigation

**Problem**: Seven navigation items require excessive clicking to access different functional areas during time-critical election management.

**Solution**: Implement customizable dashboard with pinnable shortcuts. Add command palette for rapid navigation (Ctrl+K). Provide single-screen visibility of all critical metrics.

**Impact**: Improves RO efficiency during elections, reduces time to locate critical information.

**Effort**: Medium — Frontend enhancement with state management for customization.

---

#### Recommendation 7: Implement Real-Time Data Updates

**Problem**: Manual refresh required for updated dashboard statistics creates inefficiency and potential for acting on stale data.

**Solution**: Implement WebSocket-based real-time updates for critical statistics. Add clear data freshness indicators.

**Impact**: Improves RO situational awareness, reduces refresh-related workflow interruption.

**Effort**: Medium — Backend WebSocket implementation with frontend subscription.

---

#### Recommendation 8: Provide Progressive Web App Capability

**Problem**: Mobile-first requirement suggests many users will access via mobile devices, but current specifications don't address offline capability or app-like experience.

**Solution**: Implement PWA with offline capability for critical functions. Enable installation to home screen. Implement push notifications for voting reminders and batch status.

**Impact**: Improves mobile experience, enables voting in areas with intermittent connectivity, increases engagement through notifications.

**Effort**: Medium — PWA implementation with service worker and push notification integration.

---

### 7.3 Long-Term Recommendations

These recommendations address strategic improvements for future system iterations.

#### Recommendation 9: Implement Voter Education Program

**Problem**: Low technical literacy across voter population creates barriers to effective system use and trust formation.

**Solution**: Develop comprehensive voter education program including video tutorials, in-person workshops at registration centers, SMS-based learning modules, and partnerships with community organizations.

**Impact**: Improves registration completion rates, increases voting confidence, reduces support burden.

**Effort**: High (primarily programmatics, not technical) — Requires content development, partnership building, and rollout planning.

---

#### Recommendation 10: Establish Ongoing User Research Program

**Problem**: Initial research provides baseline understanding but cannot anticipate all user needs or detect emerging issues.

**Solution**: Establish continuous user research program including post-registration and post-voting surveys, regular usability testing with representative users, analytics implementation for behavior tracking, and feedback mechanism integration.

**Impact**: Enables continuous improvement based on user evidence, supports rapid identification and resolution of emerging issues.

**Effort**: Medium (ongoing) — Requires research infrastructure, team, and process establishment.

---

### 7.4 Impact vs. Effort Matrix

| Recommendation | Impact | Effort | Priority |
|---------------|--------|--------|----------|
| Biometric Alternatives | Critical | Medium | 1 |
| Location Selection Simplification | High | Low-Medium | 2 |
| Batch System Education | High | Low | 3 |
| WCAG 2.2 Compliance | Critical | Medium-High | 4 |
| Vote Confirmation Clarity | Medium | Low | 5 |
| RO Dashboard Optimization | Medium | Medium | 6 |
| Real-Time Updates | Medium | Medium | 7 |
| PWA Capability | Medium | Medium | 8 |
| Voter Education Program | High | High | 9 |
| Ongoing Research Program | Medium | Medium | 10 |

---

## 8. Usability Testing Protocol

### 8.1 Test Objectives

The usability testing program validates that users can successfully complete core tasks and identifies specific interface issues requiring remediation. Testing focuses on task completion rates, time on task, error rates, and user satisfaction.

### 8.2 Test Methods

#### Moderated Remote Testing

Moderated remote testing provides in-depth qualitative insights through screen sharing and conversation with participants. This method suits complex tasks requiring verbalization of thought processes and investigation of user expectations.

**Participants per User Group**: 8-10

**Duration**: 45-60 minutes per session

**Best For**: Registration flow, voting flow, understanding confusion points

---

#### Unmoderated Remote Testing

Unmoderated remote testing provides quantitative completion data from larger samples without moderator influence. This method suits task completion rate measurement and comparison across user segments.

**Participants per User Group**: 20-30

**Duration**: 15-20 minutes per session

**Best For**: Task completion validation, time-on-task measurement, error rate identification

---

### 8.3 Test Scenarios

#### Registration Task Scenarios

**Scenario 1: New Voter Registration**
> You need to register to vote in the upcoming election. Start from the voter registration page and complete the full registration process. Think aloud as you proceed, telling me what you're thinking and any concerns you have.

Success Criteria: Complete all five steps and receive confirmation number

Metrics: Completion rate, time on task, error count, satisfaction score

---

**Scenario 2: Registration Error Recovery**
> You've started registering but received an error message. Show me how you would handle this situation and continue with registration.

Success Criteria: Recover from error and complete registration

Metrics: Error recovery time, navigation path, satisfaction score

---

#### Voting Task Scenarios

**Scenario 3: Complete Voting Process**
> It's voting day and you've received your batch assignment. Complete the voting process from login through confirmation. Think aloud about your understanding of each step.

Success Criteria: Complete all voting steps and receive confirmation

Metrics: Completion rate, time on task, confusion points, satisfaction score

---

**Scenario 4: Batch Waiting Understanding**
> After authenticating, you're assigned to a batch that's not yet active. Show me what you understand about your status and what you would do next.

Success Criteria: Correctly describe batch status and expected wait

Metrics: Comprehension accuracy, confidence level, question asking

---

### 8.4 Success Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Task Completion Rate | >90% | <75% |
| Time on Task (Registration) | <10 minutes | >15 minutes |
| Time on Task (Voting) | <8 minutes | >12 minutes |
| Error Rate | <10% | >20% |
| Satisfaction Score (SUS) | >70 | <50 |
| User Confidence | >4/5 | <3/5 |

---

## 9. Accessibility Testing Protocol

### 9.1 Automated Testing

Implement automated accessibility testing within the CI/CD pipeline to catch regressions before deployment.

**Tools**: axe-core, WAVE, Lighthouse

**Frequency**: Every pull request for affected components, full scan before release

**Thresholds**: Zero WCAG 2.2 Level AA violations for critical paths

---

### 9.2 Manual Testing

Conduct manual keyboard navigation testing and screen reader compatibility testing for all user flows.

**Screen Readers**: JAWS (Windows), NVDA (Windows), VoiceOver (macOS/iOS)

**Test Frequency**: Every major release, after significant interface changes

**Testers**: Internal QA team plus external users with disabilities

---

### 9.3 User Testing with Disabilities

Recruit users with disabilities for qualitative testing to identify barriers not caught by automated or expert manual testing.

**Participants**: Minimum 5 users per disability category (visual, motor, cognitive)

**Methods**: Task-based usability testing, interview, observation

**Compensation**: Appropriate for time and expertise level

---

## 10. Ongoing Research Plan

### 10.1 Analytics Implementation Requirements

The following analytics events must be implemented to support continuous improvement:

#### Registration Funnel Analytics

- Step entry and exit for each registration step
- Time spent on each step
- Error occurrence and recovery
- Abandonment point tracking
- Retry frequency

#### Voting Flow Analytics

- Login success and failure rates
- Biometric verification success rate
- Batch status comprehension (survey after status display)
- Ballot interaction patterns
- Submission success and failure rates
- Verification feature usage

#### Dashboard Analytics

- Navigation pattern analysis
- Time to locate specific information
- Feature usage frequency
- Report generation usage

---

### 10.2 Feedback Collection Mechanisms

Implement multiple feedback channels for users to report issues and provide suggestions:

**In-App Feedback**: Report issue button available on all screens with optional screenshot attachment

**SMS Feedback**: Shortcode for SMS feedback submission accessible from any phone

**Post-Session Surveys**: Optional survey after registration completion and voting submission

**Support Ticket Integration**: Feedback routed to appropriate support channel with categorization

---

### 10.3 Post-Election Analysis Plan

Following each election cycle, conduct comprehensive analysis:

1. **Funnel Analysis**: Identify registration and voting funnel drop-off points with root cause investigation

2. **Comparative Analysis**: Compare completion rates and times across user segments (age, geography, device)

3. **Error Analysis**: Categorize and prioritize errors by frequency and severity

4. **Accessibility Audit**: Conduct fresh accessibility audit with users with disabilities

5. **Survey Analysis**: Synthesize feedback from post-session surveys and support tickets

6. **Recommendations**: Develop prioritized improvement recommendations for next election cycle

---

### 10.4 A/B Testing Framework

Establish infrastructure for A/B testing to validate design improvements:

**Testable Elements**: Registration flow variations, voting confirmation interfaces, dashboard layouts, error message wording

**Statistical Requirements**: Minimum detectable effect of 5%, minimum sample size calculation for each test, 95% confidence threshold

**Test Duration**: Minimum 7 days or until sample size achieved, whichever is longer

**Ethics Review**: All A/B tests involving user experience must pass ethics review

---

## 11. Conclusion

This UX research report provides a comprehensive foundation for improving the blockchain voting system user experience. The research identifies critical barriers to participation, particularly around biometric enrollment accessibility and batch system comprehension, while also highlighting opportunities to build trust through transparency and clear communication.

The recommendations presented prioritize impact and feasibility, starting with immediate-term actions that address the most significant barriers to successful deployment. Implementation of biometric alternatives, location selection improvements, batch system education, and accessibility compliance will significantly improve the system's ability to serve all eligible voters.

The ongoing research plan ensures continuous improvement beyond initial deployment, with analytics, feedback mechanisms, and post-election analysis providing evidence for iterative enhancement. Given the high-stakes nature of electoral systems, where user confidence and accessibility are paramount, this research-informed approach to user experience design will support successful implementation of this ambitious blockchain voting initiative.

The system has significant potential to improve electoral participation, reduce fraud, and increase transparency in Kenyan elections. However, realizing this potential requires careful attention to the user experience challenges identified in this research, particularly for the most vulnerable populations whose participation is essential for democratic legitimacy.

---

## Appendix A: Research Artifacts

### A.1 Interview Discussion Guides

[Interview guides for voter, RO, and admin interviews to be developed based on this research plan]

### A.2 Survey Instruments

[Post-registration and post-voting survey instruments to be developed]

### A.3 Usability Test Scripts

[Moderated and unmoderated usability test task scripts to be developed]

---

## Appendix B: Compliance Checklist

### B.1 WCAG 2.2 Level AA Compliance

| Success Criterion | Status | Notes |
|-------------------|--------|-------|
| 1.1.1 Non-text Content | Requires Audit | |
| 1.4.3 Contrast (Minimum) | Specified | 4.5:1 for text |
| 1.4.4 Resize text | Requires Audit | |
| 2.1.1 Keyboard | Requires Audit | |
| 2.4.3 Focus Order | Requires Audit | |
| 3.1.1 Language of Page | Requires Audit | |
| 3.3.1 Error Identification | Specified | Error handling defined |
| 3.3.2 Labels or Instructions | Specified | Form validation defined |
| 2.4.11 Focus Not Obscured (Minimum) | Requires Audit | WCAG 2.2 new criterion |
| 3.3.7 Redundant Entry | Requires Audit | WCAG 2.2 new criterion |
| 3.3.8 Accessible Authentication | Requires Audit | WCAG 2.2 new criterion |

---

## Document Information

**Research Date**: March 28, 2026

**Researcher**: UX Research Team

**Version**: 1.0

**Next Review Date**: Post-election analysis following initial deployment

---

*This research report provides evidence-based recommendations for improving the blockchain voting system user experience. All recommendations should be validated through user testing before implementation.*