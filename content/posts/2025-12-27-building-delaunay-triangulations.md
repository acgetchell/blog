+++
title = "Building Delaunay Triangulations"
date = 2025-12-27T15:10:20-08:00
draft = false

[taxonomies]
tags = ["cdt","cgal", "delaunay", "geometry", "triangulation"]
+++

[Awhile ago](@/posts/designing-a-metropolis-class.md), I started discussing the internals of a Metropolis class for [MCMC] sampling of ensembles
produced by causal dynamical triangulations, a promising approach to quantum gravity that allows the use of computers. Well, since then I've experienced
a number of things:

- [CGAL] is an amazing library with decades of scholarship behind it. However, to make use of it [my implementation] required over
160 other C++ libraries, including heavyweight dependencies like [Boost] and [Eigen]. I spent more time managing these dependencies than I
did writing useful code to take advantage of CGAL's capabilities.
- I also found that implementing the [Pachner] moves necessary for [CDT] was more difficult than I expected, and I alternated between making progress and getting stuck on various issues ranging from various library bugs, to [impedance mismatches], down to compiler-level issues.
- Finally, I discovered that my particular use case for [CGAL] involved millions of repeated re-triangulations that resulted in various memory leaks, segfaults, and other impossible-for-me-to-debug issues. (Ironically, just keeping my project up-to-date I filed many, [many bug reports] exposing issues not seen in usual test cases.)

All of this finally tipped the balance from "use these battle-tested libraries" to "roll my own implementation".

After this experience, I decided that I wanted:

- A performant, memory and thread-safe language that allows me to do low-level things while managing complexity
- Ideally with a functional programming paradigm to make reasoning about code easier
- And a developer-friendly toolchain that makes things like [dependency management], [linting], [testing], and [documenting] easy instead of a constant struggle
- With a reasonable [ecosystem] of libraries for numerical computing, linear algebra, and data visualization

I chose [Rust] 🦀.

(I considered [Julia], but ruled out garbage-collected languages, which also eliminates [Python], despite it's popularity in scientific computing.
To be fair, I do use Python for tooling and data analysis, just not for performance-critical code.)

[This project](https://github.com/acgetchell/CDT-plusplus) has already progressed through numerous iterations and languages.
The [first implementation] I started working with was in [Lisp]; from there I attempted to port it to [Clojure] and then [F#] before finding [CGAL] and setting on a full re-write in [C++]. That, in turn, led to many years of struggle.

So, I started afresh with the building blocks[^1]: implement a Delaunay triangulation library for Rust, using CGAL as a
reference implementation, with only the functionality I needed for [CDT]. Originally this library was called `d-delaunay`, but then I found the
maintainer of the `delaunay` crate and after a brief discussion he agreed to transfer ownership to me. So now I've expanded the goals of the new crate to
also be useful for the original users. Along the way I completed a [Rust bootcamp].

Then AI came along and turbocharged my development efficiency. (In fact, there were so many game-changing moments that I was convinced to pursue further research and studies, but that's the topic for another post. 🙂)

I have been able to rapidly iterate on the implementation. I have a much better understanding and appreciation for the algorithms in general and CGAL's
design decisions in particular. And I have mostly followed CGAL's design, with a few guiding principles:

- Don't Repeat Yourself (DRY) - I ❤️ 🦀 macros!
- You Ain't Gonna Need It (YAGNI) - Only implement what is necessary, when it is necessary.
- Idiomatic Rust - I hope that using this crate will feel natural to Rustaceans.
- Performance & Memory Safety - This needs to be both fast and accurate. My [CDT use case] will re-triangulate millions of times per simulation. I ❤️ 🦀 error handling!
- Reproducibility & Accuracy - Floating point errors are the bane of computational geometry. The library needs to be tested against and handle a wide
range of edge cases. I ❤️ [Property-Based Testing]! (And [Kani] is a stretch goal for formal verification of critical algorithms.)

So, after a few years of intermittent work, I present to you [delaunay] 📦!

It's still a work in progress, but I am excited about the how far I've come. You can see what's been done in the [CHANGELOG.md] [^2], as well as what I'm
still planning to do in the [issues] and [documentation].

I look forward to sharing more about it in future posts!

[^1]: Said building blocks expanded to include fast linear algebra, which I started off by using [nalgebra], but then after testing wrote my own minimal
[stack-based linear algebra library] optimized for small dimensions.

[^2]: Generating these automatically from commits led to another Python side quest, which I hope to publish on PyPI.

[CGAL]: https://www.cgal.org/
[MCMC]: https://grokipedia.com/page/Markov_chain_Monte_Carlo
[my implementation]: https://github.com/acgetchell/CDT-plusplus
[Boost]: https://www.boost.org/
[Eigen]: https://eigen.tuxfamily.org/dox/
[Pachner]: https://www.sciencedirect.com/science/article/pii/S0195669813800807
[CDT]: https://arxiv.org/abs/hep-th/0105267
[impedance mismatches]: https://github.com/acgetchell/bistellar-flip/
[many bug reports]: https://github.com/search?q=author%3Aacgetchell+is%3Aissue+cgal&type=issues
[Rust]: https://www.rust-lang.org/
[delaunay]: https://crates.io/crates/delaunay
[first implementation]: https://arxiv.org/pdf/1110.6875
[Lisp]: https://www.sbcl.org
[Clojure]: https://clojure.org/
[F#]: https://fsharp.org/
[C++]: https://isocpp.org/
[Property-Based Testing]: https://crates.io/crates/proptest
[Kani]: https://model-checking.github.io/kani/
[CHANGELOG.md]: https://github.com/acgetchell/delaunay/blob/main/CHANGELOG.md
[issues]: https://github.com/acgetchell/delaunay/issues
[documentation]: https://github.com/acgetchell/delaunay/tree/main/docs
[nalgebra]: https://crates.io/crates/nalgebra
[stack-based linear algebra library]: https://crates.io/crates/la-stack
[Julia]: https://julialang.org/
[dependency management]: https://doc.rust-lang.org/cargo/
[linting]: https://doc.rust-lang.org/stable/clippy/index.html
[testing]: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
[documenting]: https://doc.rust-lang.org/cargo/commands/cargo-doc.html
[ecosystem]: https://crates.io/search?q=scientific%20computing
[Python]: https://www.python.org/
[Rust bootcamp]: https://letsgetrusty.com
[CDT use case]: https://github.com/acgetchell/causal-dynamical-triangulations
