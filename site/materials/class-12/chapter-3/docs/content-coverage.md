# Class XII — Chapter 3 content coverage

Prepared locally for later website integration. This is the third chapter in this local Class XII sequence; the STB textbook labels it **Unit 17: Second Law of Thermodynamics**.

## Textbook evidence

All pages were visually inspected in `12th-class-physics-sindh-text-book.pdf`: printed pages 35–53, PDF pages 39–57 (one-based). Coverage follows the learning outcomes, teaching text, worked examples, concept map and all exercise sections.

| Topic | Printed pages | PDF pages |
| --- | --- | --- |
| Learning outcomes | 35 | 39 |
| Kelvin–Planck and Clausius statements; engine balance and efficiency | 36–37 | 40–41 |
| Reversible and irreversible processes; insulated free expansion | 37–38 | 41–42 |
| Petrol/Otto and diesel engines and strokes | 38–40 | 42–44 |
| Carnot engine, cycle stages, diagrams and efficiency theorem | 40–42 | 44–46 |
| Refrigerator, components, COP and cooling-time examples | 43–45 | 47–49 |
| Entropy definition, transfer, units and second law | 45–46 | 49–50 |
| Energy degradation, unavailable energy, heat death, time arrow | 47–48 | 51–52 |
| Phase-change and finite-temperature entropy examples | 49 | 53 |
| Summary, concept map, conceptual questions and numerical exercises | 50–53 | 54–57 |

## Scientific clarification

The original practice questions are independently written; they are not represented as authenticated past papers or statistically frequent questions. Entry-test style describes their reasoning and format, not proven appearance in a particular examination. ECAT/NET alignment is broad and must be read with the official scope guide supplied elsewhere in this chapter folder. MDCAT enrichment is not presented as confirmed current syllabus coverage.

The following textbook simplifications/errors are corrected rather than copied:

- A petrol engine follows an approximate Otto cycle, not the reversible Carnot cycle (printed page 39 conflicts with the preceding Otto description).
- A refrigerator's COP is not its thermal efficiency; it can exceed one. The Carnot COP is an ideal upper bound for fixed reservoirs.
- `ΔS = Qrev/T` requires reversible isothermal heat transfer. General entropy change is `∫δQrev/T`; actual irreversible heat divided by temperature is not generally the system entropy change.
- System entropy can decrease; the second law constrains the combined system and surroundings. The freezing example on printed page 49 omits the negative sign for the water's entropy change.
- Finite heating at constant heat capacity has `ΔS = mc ln(Tf/Ti)`. The textbook mean-temperature calculation is an approximation, not an exact identity.
- Kelvin temperatures are required in temperature ratios. A cyclic engine cannot convert all heat from a single reservoir into work; this does not prohibit complete heat-to-work conversion during a noncyclic ideal-gas isothermal expansion.
- Heat death is the chapter's idealized extrapolation of equilibration, not a demonstrated schedule or a precise cosmological prediction.

## Practice design

Notes explain formulas, assumptions, derivations, worked examples, common errors and the exercise skills. MCQs cover conceptual, numerical, statement, graph-description and application reasoning. Four distinct options and exactly one intended correct answer are required. Cards promote verbal reasoning; suggested interactive activities include reservoir sliders, Carnot-cycle sorting, refrigerator energy accounting and an entropy ledger.

Quantitative answers, signs, Kelvin conversions and distinct distractors are audited before delivery. Extensions are labelled separately from direct textbook core coverage.

## Delivered content and audit

`content.json` contains **32 notes, 142 MCQs and 44 concept cards**. The bank has 31 Easy, 79 Medium and 32 Hard questions; 125 are Core and 17 are Extension. Format coverage is 42 Concept, 56 Numerical, 21 Statement, 18 Application and 5 Graph questions. Graph questions describe the diagram explicitly so the prompt remains answerable without an unavailable image.

| MCQ IDs | Coverage |
| --- | --- |
| 001–016 | Statements, engine energy balance, efficiency and power |
| 017–026 | Reversibility, friction, free expansion and adiabatic distinctions |
| 027–036 | Petrol/Otto, diesel, ignition, strokes and cycle rate |
| 037–070 | Carnot stages, P–V interpretation, efficiency, temperature ratios, bounds and T–S extensions |
| 071–098 | Refrigerator operation, components, energy balance, COP, ideal bounds, cooling time and heat-pump extensions |
| 099–128 | Entropy state function, reversible-path definition, reservoirs, cycles, phase changes, signs and finite-heating/mixing extensions |
| 129–138 | Work potential, energy degradation, time arrow and heat-death interpretation |
| 139–140 | Combined energy/second-law inspection and entropy-constrained engine output |
| 141–142 | Explicitly sourced official-university-sample prerequisite adaptations |

All 56 Numerical questions were recomputed independently from their physical relations, including multi-part values and signs, then compared with the written answers at their stated rounding precision. Structural checks verified unique IDs and question prompts, four distinct options, exact correct-index/answer alignment, valid topic references and complete explanations. These checks do not claim independent external peer review.

Notes include ten buttons linked to the planned engine, Carnot-cycle, refrigerator, mixing and ideal-gas entropy activities. The content does not publish itself or alter the live website.

## Official sample adaptations and exam limits

The two labelled Extension adaptations cite the [DHA Suffa University Fall 2024 official sample](https://www.dsu.edu.pk/wp-content/uploads/2024/08/sample_tes_paper_2024-UPDATE.pdf), PDF page 13, Physics Q14–Q15. Question 141 makes the molar ideal-gas assumptions explicit in `Cp − Cv = R`; question 142 uses a new 750 J value for an ideal-gas isothermal first-law calculation. Their `source` metadata records the location and changes. These are prerequisite bridges, **not verified second-law past questions**.

The remaining 140 questions are original practice. ECAT/NET tags indicate intended engineering-admission practice, not proof that those specific questions appeared in official papers. No MDCAT tag is attached to this bank: explicit current second-law syllabus support was not established. No question is represented as statistically “most repeated,” and no leaked or unverified coaching-bank material is attributed to an examination body.
