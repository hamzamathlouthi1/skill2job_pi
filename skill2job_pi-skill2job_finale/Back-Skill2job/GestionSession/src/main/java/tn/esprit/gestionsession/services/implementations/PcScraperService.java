package tn.esprit.gestionsession.services.implementations;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import tn.esprit.gestionsession.entities.PcOffer;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class PcScraperService {

    private static final Logger logger = Logger.getLogger(PcScraperService.class.getName());

    public List<PcOffer> scrapeSite() {
        List<PcOffer> offers = new ArrayList<>();

        for (int page = 1; page <= 3; page++) {
            try {
                List<PcOffer> pageOffers = scrapePage(page);
                offers.addAll(pageOffers);
                logger.log(Level.INFO, "Page " + page + ": scraped " + pageOffers.size() + " offers");
            } catch (Exception e) {
                logger.log(Level.WARNING, "Failed to scrape page " + page + ": " + e.getMessage());
            }
        }

        if (offers.isEmpty()) {
            logger.log(Level.WARNING, "Scraping returned 0 results, using fallback mock data");
            return getMockOffers();
        }

        logger.log(Level.INFO, "Total scraped: " + offers.size());
        return offers;
    }

    private List<PcOffer> scrapePage(int page) throws Exception {
        String url = "https://www.tunisianet.com.tn/301-pc-portable-tunisie";
        if (page > 1) url += "?page=" + page;

        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "fr-FR,fr;q=0.9")
                .header("Accept-Encoding", "gzip, deflate, br")
                .referrer("https://www.google.com")
                .timeout(15000)
                .get();

        List<PcOffer> offers = new ArrayList<>();

        // Try multiple PrestaShop selectors
        Elements products = doc.select("article.product-miniature");
        if (products.isEmpty()) products = doc.select(".js-product-miniature");
        if (products.isEmpty()) products = doc.select(".thumbnail-container");
        if (products.isEmpty()) products = doc.select(".product-item");

        logger.log(Level.INFO, "Page " + page + ": found " + products.size() + " product elements");

        for (Element product : products) {
            try {
                PcOffer offer = extractOffer(product);
                if (offer != null) offers.add(offer);
            } catch (Exception e) {
                logger.log(Level.FINE, "Error parsing product: " + e.getMessage());
            }
        }

        return offers;
    }

    private PcOffer extractOffer(Element product) {
        // Name
        String name = "";
        for (String sel : new String[]{".product-title a", "h2.h3 a", "h3 a", ".product-name a", "h2 a"}) {
            Element el = product.selectFirst(sel);
            if (el != null && !el.text().trim().isEmpty()) {
                name = el.text().trim();
                break;
            }
        }
        if (name.isEmpty()) return null;

        // Price
        double price = 0;
        for (String sel : new String[]{".current-price-value", ".price", "span.price", ".product-price"}) {
            Element el = product.selectFirst(sel);
            if (el != null) {
                String raw = el.text().replaceAll("[^0-9.,]", "").replace(",", ".");
                if (!raw.isEmpty()) {
                    try {
                        double p = Double.parseDouble(raw);
                        if (p > 0) { price = p > 10000 ? p / 1000.0 : p; break; }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        if (price <= 0) return null;

        // Description for specs
        String desc = "";
        Element descEl = product.selectFirst(".listds, .description, .product-description, .product-short-description");
        if (descEl != null) desc = descEl.text();

        String fullText = name + " " + desc;

        return new PcOffer(name, extractCpu(fullText), extractGpu(fullText), extractRam(fullText), price, "Tunisianet");
    }

    // ─── FALLBACK MOCK DATA ──────────────────────────────────────────────────

    private List<PcOffer> getMockOffers() {
        List<PcOffer> mocks = new ArrayList<>();
        mocks.add(new PcOffer("Lenovo IdeaPad 3 15IAU7", "Intel Core i5", "Intel UHD", 8, 1499.0, "Tunisianet"));
        mocks.add(new PcOffer("HP 15s-fq5000nk", "Intel Core i5", "Intel Iris Xe", 8, 1350.0, "Tunisianet"));
        mocks.add(new PcOffer("ASUS VivoBook 15 X1502ZA", "Intel Core i5", "Intel Iris Xe", 16, 1799.0, "Tunisianet"));
        mocks.add(new PcOffer("Acer Aspire 5 A515-57", "Intel Core i7", "Intel Iris Xe", 16, 2199.0, "Tunisianet"));
        mocks.add(new PcOffer("Dell Inspiron 15 3520", "Intel Core i3", "Intel UHD", 8, 1199.0, "Tunisianet"));
        mocks.add(new PcOffer("Lenovo LOQ 15IRH8", "Intel Core i7", "NVIDIA RTX 4060", 16, 3299.0, "Tunisianet"));
        mocks.add(new PcOffer("HP Victus 15-fa1097nk", "Intel Core i5", "NVIDIA GTX 1650", 8, 2399.0, "Tunisianet"));
        mocks.add(new PcOffer("ASUS ROG Strix G15", "AMD Ryzen 7", "NVIDIA RTX 3060", 16, 3799.0, "Tunisianet"));
        mocks.add(new PcOffer("Lenovo ThinkPad E14", "Intel Core i7", "Intel Iris Xe", 16, 2899.0, "Tunisianet"));
        mocks.add(new PcOffer("HP EliteBook 840 G9", "Intel Core i7", "Intel Iris Xe", 32, 4199.0, "Tunisianet"));
        mocks.add(new PcOffer("Acer Nitro 5 AN515-58", "Intel Core i5", "NVIDIA RTX 3060", 8, 2799.0, "Tunisianet"));
        mocks.add(new PcOffer("MSI Modern 15 B12M", "Intel Core i7", "Intel Iris Xe", 16, 2499.0, "Tunisianet"));
        mocks.add(new PcOffer("Dell XPS 15 9530", "Intel Core i9", "NVIDIA RTX 4070", 32, 6999.0, "Tunisianet"));
        mocks.add(new PcOffer("Lenovo IdeaPad Gaming 3", "AMD Ryzen 5", "NVIDIA RTX 3050", 8, 2199.0, "Tunisianet"));
        mocks.add(new PcOffer("HP 250 G9", "Intel Core i3", "Intel UHD", 4, 899.0, "Tunisianet"));
        return mocks;
    }

    // ─── SPEC EXTRACTORS ────────────────────────────────────────────────────

    private Integer extractRam(String text) {
        if (text == null) return null;
        if (text.contains("32 Go") || text.contains("32Go") || text.contains("32GB") || text.contains("32 GB")) return 32;
        if (text.contains("16 Go") || text.contains("16Go") || text.contains("16GB") || text.contains("16 GB")) return 16;
        if (text.contains("8 Go")  || text.contains("8Go")  || text.contains("8GB")  || text.contains("8 GB"))  return 8;
        if (text.contains("4 Go")  || text.contains("4Go")  || text.contains("4GB")  || text.contains("4 GB"))  return 4;
        return null;
    }

    private String extractCpu(String text) {
        if (text == null) return null;
        if (text.contains("Core i9") || text.contains("i9-")) return "Intel Core i9";
        if (text.contains("Core i7") || text.contains("i7-")) return "Intel Core i7";
        if (text.contains("Core i5") || text.contains("i5-")) return "Intel Core i5";
        if (text.contains("Core i3") || text.contains("i3-")) return "Intel Core i3";
        if (text.contains("Ryzen 9")) return "AMD Ryzen 9";
        if (text.contains("Ryzen 7")) return "AMD Ryzen 7";
        if (text.contains("Ryzen 5")) return "AMD Ryzen 5";
        if (text.contains("Ryzen 3")) return "AMD Ryzen 3";
        if (text.contains("Celeron")) return "Intel Celeron";
        if (text.contains("Pentium")) return "Intel Pentium";
        if (text.contains("Intel"))   return "Intel";
        if (text.contains("Ryzen"))   return "AMD Ryzen";
        return null;
    }

    private String extractGpu(String text) {
        if (text == null) return null;
        if (text.contains("RTX 4090")) return "NVIDIA RTX 4090";
        if (text.contains("RTX 4080")) return "NVIDIA RTX 4080";
        if (text.contains("RTX 4070")) return "NVIDIA RTX 4070";
        if (text.contains("RTX 4060")) return "NVIDIA RTX 4060";
        if (text.contains("RTX 3080")) return "NVIDIA RTX 3080";
        if (text.contains("RTX 3070")) return "NVIDIA RTX 3070";
        if (text.contains("RTX 3060")) return "NVIDIA RTX 3060";
        if (text.contains("RTX 3050")) return "NVIDIA RTX 3050";
        if (text.contains("RTX"))      return "NVIDIA RTX";
        if (text.contains("GTX 1650")) return "NVIDIA GTX 1650";
        if (text.contains("GTX"))      return "NVIDIA GTX";
        if (text.contains("MX550"))    return "NVIDIA MX550";
        if (text.contains("MX"))       return "NVIDIA MX";
        if (text.contains("Radeon"))   return "AMD Radeon";
        if (text.contains("Iris Xe"))  return "Intel Iris Xe";
        if (text.contains("UHD"))      return "Intel UHD";
        return null;
    }
}