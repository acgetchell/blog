---
title: "A Tale of Two Test Frameworks"
date: 2022-05-20T12:57:43-07:00
draft: false
---

As I've mentioned earlier, I'm writing some [scientific code][1] that needs to be accurate and fast.

> That is, some entity other than me should check for inevitable errors.

So I started Test Driven Development using [GoogleTest]. Then I saw Behavior Driven Development ([BDD]) and switched to [Catch2].

> This was a bit of a headache, as I had to essentially rewrite tests from scratch, but I learned to write better tests.

That went well, but when I had a few folks look over the code, they noted the difficulty of getting the stack up and running[^1].

> Also, [gcc] started not being able to compile the project with tests enabled.

So I looked around again, and found [doctest], which was based on [Catch2] but offered [much faster compile times][2] and the model of
including tests right into the code (although I opted to keep them separate, for now). Around this time I'd asked someone else to look at a few things in my project, so
it seemed like a good time to try it out.

Then Catch2 dropped the long awaited [v3][3], so --

> Yep, let's compare.

It turns out that much of the migration work I did from [Catch2] -> [doctest] was also necessary for Catch2 v2 -> Catch2 v3.

So now I have [features/doctest] and [features/catch2v3] for side-by-side comparison.

Right away, I noticed that [clang-tidy] does not like [doctest]:

```bash
adam@hapkido ~ $ clang-tidy --version
Homebrew LLVM version 13.0.1
  Optimized build.
  Default target: arm64-apple-darwin21.5.0
  Host CPU: cyclone
```

(*Full output [here][4]:*)

```bash
adam@hapkido ~/projects/CDT-plusplus (develop) $ git checkout feature/doctest
Switched to branch 'feature/doctest'
Your branch is up to date with 'origin/feature/doctest'.
adam@hapkido ~/projects/CDT-plusplus (feature/doctest) $ cd scripts/
adam@hapkido ~/projects/CDT-plusplus/scripts (feature/doctest) $ ./clang-tidy.sh

... elided ...

-- Build files have been written to: /Users/adam/projects/CDT-plusplus/build
[2/26] Building CXX object tests/CMakeFiles/CDT_test.dir/Settings_test.cpp.o
/Users/adam/projects/CDT-plusplus/tests/Settings_test.cpp:19:1: warning: initialization of 'DOCTEST_ANON_VAR_3' with static storage duration may throw an exception that cannot be caught [cert-err58-cpp]
SCENARIO("Check settings" * doctest::may_fail())
^
/Users/adam/projects/CDT-plusplus/vcpkg_installed/arm64-osx/include/doctest/doctest.h:2800:24: note: expanded from macro 'SCENARIO'
#define SCENARIO(name) DOCTEST_SCENARIO(name)
                       ^
/Users/adam/projects/CDT-plusplus/vcpkg_installed/arm64-osx/include/doctest/doctest.h:2716:32: note: expanded from macro 'DOCTEST_SCENARIO'
#define DOCTEST_SCENARIO(name) DOCTEST_TEST_CASE("  Scenario: " name)
                               ^
/Users/adam/projects/CDT-plusplus/vcpkg_installed/arm64-osx/include/doctest/doctest.h:2012:5: note: expanded from macro 'DOCTEST_TEST_CASE'
    DOCTEST_CREATE_AND_REGISTER_FUNCTION(DOCTEST_ANONYMOUS(DOCTEST_ANON_FUNC_), decorators)
    ^
note: (skipping 3 expansions in backtrace; use -fmacro-backtrace-limit=0 to see all)
/Users/adam/projects/CDT-plusplus/vcpkg_installed/arm64-osx/include/doctest/doctest.h:365:29: note: expanded from macro 'DOCTEST_CAT'
#define DOCTEST_CAT(s1, s2) DOCTEST_CAT_IMPL(s1, s2)
                            ^
/Users/adam/projects/CDT-plusplus/vcpkg_installed/arm64-osx/include/doctest/doctest.h:364:34: note: expanded from macro 'DOCTEST_CAT_IMPL'
#define DOCTEST_CAT_IMPL(s1, s2) s1##s2
                                 ^
note: expanded from here
/Users/adam/projects/CDT-plusplus/vcpkg_installed/arm64-osx/include/doctest/doctest.h:1438:9: note: possibly throwing constructor declared here
        TestCase(funcType test, const char* file, unsigned line, const TestSuite& test_suite,

... etc ...
```

However, it does swimmingly with [PVS-Studio]:

[Results](/html/index-doctest.html)

Now, let's switch to the [features/catch2v3] branch:

```bash
adam@hapkido ~/projects/CDT-plusplus (feature/doctest) $ git checkout feature/catch2v3
Switched to branch 'feature/catch2v3'
Your branch is up to date with 'origin/feature/catch2v3'.
```

And run clang-tidy:

```bash
... elided ...
[13/26] Building CXX object tests/CMakeFiles/CDT_test.dir/Manifold_test.cpp.o
/Users/adam/projects/CDT-plusplus/tests/Manifold_test.cpp:179:9: warning: 'const auto manifold_type' can be declared as 'const auto *const manifold_type' [readability-qualified-auto]
        auto const  manifold_type = typeid(manifold.get_triangulation()).name();
        ^~~~~~~~~~
        const auto *const 

... etc ...
```

It's pretty much clear of anything [Catch2]-related.

However, the [PVS-Studio] output is tragic.

[Results](/html/index-catch2.html)

Recall, these are the exact same tests!

So, which one should I use going forward?

[Twitter poll]

[^1]: The project uses [CGAL] which uses [Boost] and [Eigen], those dependencies alone account for over a hundred libraries. You absolutely need
a package manager like [vcpkg] to handle it sanely.

[1]: https://www.adamgetchell.org/CDT-plusplus/
[GoogleTest]: https://github.com/google/googletest
[BDD]: https://cucumber.io/docs/gherkin/reference/
[Catch2]: https://github.com/catchorg/Catch2
[doctest]: https://github.com/doctest/doctest
[2]: https://github.com/doctest/doctest/blob/master/doc/markdown/benchmarks.md
[3]: https://github.com/catchorg/Catch2/blob/devel/docs/release-notes.md#301
[4]: https://gist.github.com/acgetchell/b1931e063ddfde033dd5702ee42d632f#file-doctest-clang-tidy
[clang-tidy]: https://releases.llvm.org/13.0.0/tools/clang/tools/extra/docs/ReleaseNotes.html
[PVS-Studio]: https://pvs-studio.com/en/
[features/catch2v3]: https://github.com/acgetchell/CDT-plusplus/tree/feature/catch2v3
[features/doctest]: https://github.com/acgetchell/CDT-plusplus/tree/feature/doctest
[CGAL]: https://www.cgal.org
[Boost]: https://www.boost.org
[Eigen]: https://eigen.tuxfamily.org/index.php?title=Main_Page
[vcpkg]: https://vcpkg.io/en/index.html
[gcc]: https://gcc.gnu.org
[Twitter poll]: https://twitter.com/adamgetchell/status/1528422610261798913?s=20&t=0jqURIb_nIZWKbV6vzy3KA
