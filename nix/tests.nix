{ pkgs, website, devShell, websiteApp }:

{
  # Smoke test the built website by serving it with Python HTTP server
  test-smoke = pkgs.runCommand "test-smoke"
    {
      inherit website;
      nativeBuildInputs = [ pkgs.python3 pkgs.curl ];
    }
    ''
      echo "Starting Python HTTP server for smoke tests..."

      PORT=8765
      python3 -m http.server $PORT --directory "${website}" &
      SERVER_PID=$!

      # Wait for server to be ready (up to 10 seconds)
      for i in $(seq 1 20); do
        if curl -s -o /dev/null "http://127.0.0.1:$PORT/"; then
          echo "✅ Server is ready"
          break
        fi
        sleep 0.5
        if [ "$i" = "20" ]; then
          echo "❌ Server failed to start in time"
          kill $SERVER_PID 2>/dev/null
          exit 1
        fi
      done

      FAILED=0

      check_content() {
        local path="$1"
        local expected="$2"
        local description="$3"

        if curl -s "http://127.0.0.1:$PORT$path" | grep -q "$expected"; then
          echo "✅ $description"
        else
          echo "❌ $description (expected to find: \"$expected\" at $path)"
          FAILED=1
        fi
      }

      check_status() {
        local path="$1"
        local expected_code="$2"
        local description="$3"

        actual=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT$path")
        if [ "$actual" = "$expected_code" ]; then
          echo "✅ $description (HTTP $actual)"
        else
          echo "❌ $description (expected HTTP $expected_code, got HTTP $actual)"
          FAILED=1
        fi
      }

      check_absent() {
        local path="$1"
        local unexpected="$2"
        local description="$3"

        if curl -s "http://127.0.0.1:$PORT$path" | grep -q "$unexpected"; then
          echo "❌ $description (unexpectedly found: \"$unexpected\" at $path)"
          FAILED=1
        else
          echo "✅ $description"
        fi
      }

      # Homepage
      check_status "/" "200" "Homepage returns HTTP 200"
      check_content "/" "QGIS Österreich" "Homepage has site title"
      check_content "/" "Ein freies Geographisches Informationssystem" "Homepage has first section heading"

      # Published pages
      # NOTE: /case-studies/, /community/, /tutorials/ and /rules/ are Hugo drafts
      # and are not published (they return HTTP 404). Re-add checks for them here
      # if/when those pages get published.
      check_status "/about-us/" "200" "About Us page returns HTTP 200"
      check_content "/about-us/" "Der Verein" "About Us page has expected content"

      check_status "/neuigkeiten/" "200" "Neuigkeiten page returns HTTP 200"
      check_content "/neuigkeiten/" "Neuigkeiten" "Neuigkeiten page has expected content"

      check_status "/arbeitsgruppen/" "200" "Arbeitsgruppen page returns HTTP 200"
      check_content "/arbeitsgruppen/" "Arbeitsgruppen" "Arbeitsgruppen page has expected content"

      check_status "/mitgliedschaft/" "200" "Mitgliedschaft page returns HTTP 200"
      check_content "/mitgliedschaft/" "Mitglied werden" "Mitgliedschaft page has expected content"

      check_status "/events/" "200" "Events page returns HTTP 200"
      check_content "/events/" "Veranstaltungen" "Events page has expected content"

      check_status "/blog/" "200" "Blog page returns HTTP 200"
      check_content "/blog/" "Blog" "Blog page has expected content"

      check_status "/datenschutzerklaerung/" "200" "Datenschutzerklärung page returns HTTP 200"
      check_content "/datenschutzerklaerung/" "Datenschutzerklärung" "Datenschutzerklärung page has expected content"

      # Search index (JSON output enabled on home)
      check_status "/index.json" "200" "Search JSON index returns HTTP 200"

      # 404 handling
      check_status "/this-page-does-not-exist/" "404" "Non-existent path returns HTTP 404"

      # Vendored navigation assets: the qg-top-nav component is vendored (no
      # external CDN); see static/vendor/qgis-uni-navigation/README.md
      check_status "/vendor/qgis-uni-navigation/index.js" "200" "Vendored qg-top-nav script is served"
      check_status "/vendor/qgis-uni-navigation/nav-config.json" "200" "Vendored nav-config.json is served"
      check_status "/vendor/qgis-uni-navigation/button-config.json" "200" "Vendored button-config.json is served"
      check_status "/config/navigation.json" "200" "Site navigation.json is served"

      # No external CDN references on the homepage
      check_absent "/" "qgis.github.io/qgis-uni-navigation" "Homepage has no qgis.github.io CDN reference"
      check_absent "/" "raw.githubusercontent.com" "Homepage has no raw.githubusercontent.com reference"

      kill $SERVER_PID 2>/dev/null
      wait $SERVER_PID 2>/dev/null || true

      if [ "$FAILED" = "1" ]; then
        echo ""
        echo "❌ Smoke tests FAILED"
        exit 1
      fi

      echo ""
      echo "✅ All smoke tests passed"
      echo "Smoke tests passed" > $out
    '';

  # Test dev shell has required tools
  test-dev-shell = pkgs.runCommand "test-dev-shell"
    {
      nativeBuildInputs = devShell.nativeBuildInputs or [ ]
        ++ devShell.buildInputs or [ ];
    }
    ''
      echo "Testing dev shell tools..."

      # Check hugo is available
      if ! command -v hugo &> /dev/null; then
        echo "❌ hugo not found in dev shell"
        exit 1
      fi

      echo "✅ hugo available: $(hugo version)"

      # Check python is available
      if ! command -v python3 &> /dev/null; then
        echo "❌ python3 not found in dev shell"
        exit 1
      fi

      echo "✅ python3 available: $(python3 --version)"

      # Check make is available
      if ! command -v make &> /dev/null; then
        echo "❌ make not found in dev shell"
        exit 1
      fi

      echo "✅ make available: $(make --version | head -1)"

      echo "Dev shell verification passed" > $out
    '';

  # Package builds successfully (implicit check)
  build-website = website;
}