export interface SamplePaper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  domain: string;
  abstract: string;
  fullText: string;
}

export const SAMPLE_PAPERS: SamplePaper[] = [
  {
    id: "quantum-ai",
    title: "Attention-Driven Neural Architectures for High-Fidelity Quantum State Reconstruction",
    authors: "Sarah J. Jenkins, Liang-Wei Chen, and Marcus Vance",
    journal: "Journal of Quantum Machine Intelligence",
    year: "2025",
    domain: "Artificial Intelligence & Quantum Physics",
    abstract: "Reconstructing the density matrix of large quantum states, known as Quantum State Tomography (QST), suffers from an exponential curse of dimensionality. Traditional methods like Maximum Likelihood Estimation (MLE) are computationally prohibitive for systems exceeding 8 qubits. In this work, we introduce Q-Transformer, a specialized attention-driven neural architecture designed to reconstruct high-fidelity quantum states from incomplete, noisy projective measurement data. Using a novel self-attention gating mechanism optimized for complex-valued Hilbert space representations, our model achieves a reconstruction fidelity of 99.4% for 12-qubit states, reducing computational overhead by four orders of magnitude compared to standard MLE.",
    fullText: `INTRODUCTION & OBJECTIVES
Reconstructing the state of a quantum system from experimental measurements—Quantum State Tomography (QST)—is fundamental to the development of quantum computers. However, QST is severely limited by the exponential growth of parameters as the number of qubits increases. For an N-qubit system, the density matrix contains 4^N - 1 independent variables. Traditional approaches, such as Maximum Likelihood Estimation (MLE) and Least-Squares fitting, scale exponentially in processing time, becoming completely unfeasible for systems with N > 8. 

The primary objective of this research is to develop a deep learning framework, named Q-Transformer, that circumvents this scaling limit. Specifically, we aim to:
1. Learn mapping functions from sparse, noisy Pauli-basis measurement operators to the corresponding complex-valued density matrices (ρ).
2. Achieve a reconstruction fidelity of >99% for systems containing up to 12 qubits.
3. Minimize reconstruction time to under 1.5 seconds per state, enabling real-time diagnostic calibration in active quantum processors.

METHODOLOGY
We constructed a specialized transformer architecture optimized for complex-valued arithmetic. Rather than using separate real and imaginary networks, Q-Transformer processes complex inputs natively by parameterizing the attention weights as:
  A = Softmax((Q_R * K_R^T + Q_I * K_I^T) / √d) + i * Softmax((Q_R * K_I^T - Q_I * K_R^T) / √d)
where subscripts R and I represent real and imaginary projections, and d is the attention head dimensionality.

Our experimental setup used synthetic and hardware-validated data:
1. Data Generation: We simulated random Haar-random states, Greenberger-Horne-Zeilinger (GHZ) states, and W-states for N = 4 to 12 qubits. 
2. Measurement Simulation: Projective measurements were simulated under simulated Gaussian phase noise (σ = 0.05 rad) and readout errors (2% bit-flip probability). The system was restricted to a sparse subset of Pauli measurements (only 15% of the full tomographically complete set).
3. Training: The network was trained using AdamW optimizer with a learning rate of 3e-4, using negative log-fidelity as the loss function:
  L(ρ_pred, ρ_true) = -ln(Tr[√(√ρ_true * ρ_pred * √ρ_true)]^2)
Training took 48 hours on 4x NVIDIA H100 GPUs.

RESULTS
The Q-Transformer outperformed all baseline techniques in both speed and accuracy.

1. Reconstruction Fidelity:
- For 8-qubit GHZ states, Q-Transformer achieved a reconstruction fidelity of 99.72% (±0.04%), compared to 98.1% for traditional MLE.
- For 12-qubit Haar-random states, our model reached 99.41% fidelity (using only 15% measurement coverage), whereas traditional MLE failed to converge within a 24-hour timeout window.

2. Computational Overhead:
- The time taken to reconstruct a 12-qubit state was reduced from over 18 hours (projected MLE estimate) to 0.12 seconds on a single workstation GPU. This represents an approximate 540,000x acceleration in state evaluation.
- The model showed exceptional resilience to readout errors, maintaining fidelity above 98.5% even when simulated sensor noise was increased to σ = 0.15 rad.

CONCLUSIONS & IMPLICATIONS
We have demonstrated that attention-driven neural architectures are highly suited for solving quantum-theoretic inverse problems. By exploiting localized correlations via multi-head self-attention, Q-Transformer bypasses the global search constraints that hobble MLE. 

These findings have major implications for the quantum computing industry. Quantum processing units (QPUs) can now perform real-time, on-the-fly calibration. Instead of pausing computations for hours to assess qubit coherence, engineers can run continuous background tomography using sparse measurements, improving overall system uptime and error correction performance. Future research will focus on extending this architecture to mixed states with environmental decoherence models and testing on 50+ physical transmon qubits.`
  },
  {
    id: "crispr-disease",
    title: "Synergistic Multiplex CRISPR-Cas12a Targeting for Polygenic Disease Modeling in Human Hepatocytes",
    authors: "Elena Rostova, Dr. Kenji Tanaka, and Aris Thorne",
    journal: "Nature Cellular Engineering",
    year: "2026",
    domain: "Biotechnology & Gene Therapy",
    abstract: "Modeling polygenic diseases in vitro is severely limited by the low efficiency of simultaneous multi-locus gene editing. While Cas9 systems require complex, separate guide RNA expressions, CRISPR-Cas12a possesses intrinsic RNA-processing capabilities, allowing the processing of a single crRNA array. Here, we demonstrate a synergistic multiplex platform (SyncCRISPR) using an engineered Acidaminococcus sp. Cas12a (AsCas12a-Ultra) to simultaneously target four risk alleles associated with Non-Alcoholic Steatohepatitis (NASH) in human induced pluripotent stem cell (iPSC)-derived hepatocytes. We achieved an overall quadruple-knockout efficiency of 87.3% with zero detectable off-target events, establishing a highly robust in vitro model for therapeutic screening.",
    fullText: `INTRODUCTION & OBJECTIVES
Non-Alcoholic Steatohepatitis (NASH) is a severe form of liver disease characterized by fat accumulation, inflammation, and cellular damage. Progress in understanding NASH pathogenesis is blocked by its complex polygenic nature; multiple genetic risk factors, including variants in PNPLA3, TM6SF2, MBOAT7, and GCKR, interact to drive disease progression. Standard laboratory models fail to replicate these complex genetic combinations because mutating four separate genes in a single cell line is highly inefficient and often results in high off-target genomic damage.

The objectives of this biological study were to:
1. Design and engineer a multiplexed gene-editing system capable of editing PNPLA3, TM6SF2, MBOAT7, and GCKR loci concurrently in human hepatocyte-like cells.
2. Achieve over 80% simultaneous quadruple-allele knockout (4-KO) efficiency.
3. Validate that the edited hepatocytes accurately replicate clinical NASH phenotypes, specifically intracellular triglyceride accumulation and elevated inflammatory cytokine secretion (IL-6, TNF-α).

METHODOLOGY
We utilized an engineered AsCas12a-Ultra enzyme, which displays enhanced target-site binding affinity and mismatch intolerance. 
1. Guide Design: We synthesized a single crRNA expression array containing four spacer sequences (each 21 nucleotides long) separated by the short Cas12a-specific direct repeats (20 nt). This allowed the Cas12a enzyme to process the single transcript into four mature guide RNAs autonomously.
2. Delivery System: The Cas12a-Ultra protein and the multiplex crRNA array were delivered as ribonucleoprotein (RNP) complexes using neon electroporation into human iPSC-derived hepatocytes.
3. Genotyping & Phenotypic Assays:
- Genomic editing efficiency was quantified 72 hours post-transfection using Next-Generation Sequencing (NGS) and deep-amplicon sequencing.
- Off-target cleavage was monitored using whole-genome sequencing (WGS) at 100x depth.
- Intracellular lipid accumulation was evaluated using Nile Red staining and quantitative fluorometry.
- Cytokine expression was evaluated using Enzyme-Linked Immunosorbent Assay (ELISA).

RESULTS
Our multiplex SyncCRISPR platform demonstrated unprecedented precision and efficacy:

1. Gene-Editing Efficiency:
- NGS analysis confirmed that the simultaneous knockout of all four target genes (PNPLA3, TM6SF2, MBOAT7, and GCKR) was achieved in 87.3% of the electroporated cells.
- Single, double, and triple knockout rates were 100%, 96.2%, and 91.8% respectively, confirming the highly active cleavage kinetics of the AsCas12a-Ultra variant.
- WGS scan showed zero detectable off-target cleavage events across the 50 most likely predicted off-target genomic loci.

2. Phenotypic Validation:
- The quadruple-KO hepatocytes exhibited a 3.4-fold increase in intracellular lipid accumulation within 48 hours when exposed to physiological levels of oleic/palmitic acid, closely mimicking the clinical 'steatosis' phenotype.
- Edited cells showed elevated baseline secretion of key inflammatory markers: IL-6 levels increased by 280% (p < 0.001) and TNF-α by 195% (p < 0.001) compared to unedited controls. This confirmed the onset of inflammation without requiring external immunological triggers.

CONCLUSIONS & IMPLICATIONS
The SyncCRISPR platform successfully overcomes the bottleneck of modeling polygenic disorders. By utilizing the autonomous RNA-processing traits of AsCas12a-Ultra, we demonstrated that four major risk loci can be edited simultaneously in human cells with high efficiency and absolute safety.

This breakthrough provides researchers with a highly accurate, fully humanized in vitro model of NASH. It will immediately accelerate drug discovery by allowing automated, high-throughput screening of small-molecule therapeutics on human cell lines carrying precise polygenic disease signatures, reducing reliance on costly and genetically divergent animal models.`
  },
  {
    id: "graphene-carbon",
    title: "Efficacy of Nitrogen-Doped Bio-Derived Graphene Aerogels for Selective Atmospheric Carbon Capture",
    authors: "Dr. Arthur Pendelton, Mei-Ling Chang, and David O'Connor",
    journal: "Sustainable Materials & Green Energy",
    year: "2025",
    domain: "Environmental Science & Nanotechnology",
    abstract: "Post-combustion carbon capture requires sorbent materials that combine high adsorption capacity, rapid kinetics, and low regeneration energy costs. Solid amine-functionalized silicas suffer from thermal degradation, while metal-organic frameworks (MOFs) are susceptible to moisture. Here, we report the synthesis of ultra-lightweight, nitrogen-doped graphene aerogels (N-BGAs) derived from agricultural cellulose waste (rice husks). The N-BGAs exhibit an exceptional CO2 adsorption capacity of 5.8 mmol/g at 25°C under dry conditions and maintain 92% of this capacity under 60% relative humidity. Crucially, the sorbent can be fully regenerated at 80°C under vacuum, requiring 40% less thermal energy than conventional liquid amine scrubbing.",
    fullText: `INTRODUCTION & OBJECTIVES
Mitigating global climate change demands the immediate deployment of Carbon Capture, Utilization, and Storage (CCUS) technologies. Traditional industrial carbon capture relies heavily on liquid amine scrubbing (e.g., monoethanolamine or MEA). While effective, MEA scrubbing is plagued by high regeneration energy requirements (since the entire water solvent must be heated), equipment corrosion, and the generation of toxic volatile degradation products. Solid state physical adsorbents offer a cleaner alternative, but current materials struggle to maintain selectivity for carbon dioxide (CO2) over nitrogen (N2) in the presence of water vapor (humidity).

The objectives of this material science research were to:
1. Synthesize nitrogen-doped graphene aerogels (N-BGAs) from cheap, abundant agricultural waste (rice husks) using an eco-friendly hydrothermal co-assembly method.
2. Achieve a stable CO2 adsorption capacity of >5.0 mmol/g at ambient conditions.
3. Demonstrate high selectivity for CO2 over N2 in humid gas streams, and minimize the thermal desorption temperature to below 90°C to allow regeneration using waste heat.

METHODOLOGY
1. Synthesis: Cellulose was extracted from agricultural rice husks via alkaline treatment, then converted to graphene oxide sheets through a modified Hummers' method. The graphene oxide was mixed with urea (as the nitrogen precursor) and subjected to hydrothermal gelling at 180°C for 12 hours. The resulting hydrogel was freeze-dried at -80°C for 48 hours to yield ultra-lightweight N-BGAs.
2. Characterization: Structural porosity was evaluated using Brunauer-Emmett-Teller (BET) nitrogen adsorption-desorption measurements. The nitrogen-doping concentration was verified using X-ray Photoelectron Spectroscopy (XPS).
3. Carbon Capture Evaluation:
- Pure gas (CO2 and N2) adsorption isotherms were measured from 0 to 1.2 bar at temperatures of 0°C, 25°C, and 50°C.
- Selectivity under dynamic conditions was tested in a fixed-bed reactor using a simulated flue gas composition: 15% CO2, 81% N2, and 4% H2O, mimicking typical coal-fired power plant emissions.
- Thermal regeneration was performed over 50 consecutive adsorption-desorption cycles, heating the material to 80°C under a mild vacuum of 0.1 bar.

RESULTS
The N-BGAs exhibited extraordinary performance, solving key limitations of existing physical adsorbents:

1. Structural & Chemical Properties:
- BET measurements revealed an exceptionally high specific surface area of 1450 m²/g and a total pore volume of 1.12 cm³/g, consisting of hierarchical macro-, meso-, and micropores.
- XPS confirmed successful incorporation of nitrogen atoms (7.4 at%) into the carbon lattice, primarily in the form of basic pyridinic and pyrrole configurations which act as active Lewis-base sites that interact strongly with acidic CO2 molecules.

2. Adsorption Capacity & Selectivity:
- N-BGAs demonstrated an ultimate CO2 adsorption capacity of 5.82 mmol/g at 25°C (1.0 bar).
- In simulated humid flue gas, the CO2 adsorption was only slightly reduced to 5.35 mmol/g. Under identical conditions, standard zeolite 13X experienced an 80% loss in capacity because water molecules occupied its active metal sites.
- The CO2/N2 selectivity factor was calculated as 84 (using Ideal Adsorbed Solution Theory), representing a 3-fold improvement over un-doped bio-graphene.

3. Regeneration and Cycle Life:
- Thermal desorption was completed within 8 minutes at 80°C. The energy required for regeneration was estimated at 1.9 GJ per ton of captured CO2, which is 42% lower than liquid MEA systems (3.3 GJ/ton) and 15% lower than silica-supported amines.
- Over 50 cycles of repetitive capturing and thermal desorption, the adsorption capacity remained above 95.5% of its initial value, showing superb chemical and structural stability.

CONCLUSIONS & IMPLICATIONS
We have successfully engineered a high-performance carbon-capture sorbent using agricultural waste as a precursor. The nitrogen-doped graphene aerogels (N-BGAs) show high capacity, excellent humidity tolerance, and low regeneration costs.

By utilizing rice husks, this research creates a circular economy model where agricultural waste is converted into high-value environmental nanotechnologies. The low thermal regeneration temperature (80°C) means that the carbon capture systems can be powered directly by industrial waste heat, removing the need for auxiliary steam boilers and dramatically improving the economic feasibility of direct air capture and post-combustion capture plants.`
  }
];
