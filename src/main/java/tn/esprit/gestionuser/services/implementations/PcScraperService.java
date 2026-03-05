package tn.esprit.gestionuser.services.implementations;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.stereotype.Service;
import tn.esprit.gestionuser.entities.PcOffer;

import java.util.ArrayList;
import java.util.List;

@Service
public class PcScraperService {

    public List<PcOffer> scrapeSite() {

        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        WebDriver driver = new ChromeDriver(options);

        List<PcOffer> offers = new ArrayList<>();

        try {

            // 🔥 Loop through first 3 pages
            for (int page = 1; page <= 3; page++) {

                String url = "https://www.tunisianet.com.tn/301-pc-portable-tunisie";

                if (page > 1) {
                    url += "?page=" + page + "&order=product.price.asc";
                }

                driver.get(url);

                Thread.sleep(5000); // wait page load

                List<WebElement> products =
                        driver.findElements(By.cssSelector(".thumbnail-container"));

                for (int i = 0; i < Math.min(products.size(), 10); i++) {

                    WebElement product = products.get(i);

                    try {

                        // 🔥 NAME
                        String name = product
                                .findElement(By.cssSelector(".product-title a"))
                                .getText();

                        // 🔥 DESCRIPTION (SPECS)
                        String description = "";
                        List<WebElement> descList =
                                product.findElements(By.cssSelector(".listds"));

                        if (!descList.isEmpty()) {
                            description = descList.get(0).getText();
                        }

                        // 🔥 PRICE
                        double price = 0;

                        List<WebElement> priceElements = product.findElements(
                                By.cssSelector(".wb-action-block .product-price-and-shipping span.price")
                        );

                        if (!priceElements.isEmpty()) {

                            String priceText = priceElements.get(0).getText();

                            if (priceText != null && !priceText.isEmpty()) {

                                String cleaned = priceText.replaceAll("[^0-9]", "");

                                if (!cleaned.isEmpty()) {
                                    price = Double.parseDouble(cleaned) / 1000;
                                }
                            }
                        }

                        // 🔥 EXTRACT SPECS
                        Integer ram = extractRam(description);
                        String cpu = extractCpu(description);
                        String gpu = extractGpu(description);

                        offers.add(new PcOffer(
                                name,
                                cpu,
                                gpu,
                                ram,
                                price,
                                "Tunisianet"
                        ));

                    } catch (Exception e) {
                        // skip broken product
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }

        return offers;
    }

    private Integer extractRam(String text) {
        if (text.contains("16 Go")) return 16;
        if (text.contains("8 Go")) return 8;
        if (text.contains("4 Go")) return 4;
        return null;
    }

    private String extractCpu(String text) {
        if (text.contains("Intel")) return "Intel";
        if (text.contains("Ryzen")) return "Ryzen";
        return null;
    }

    private String extractGpu(String text) {
        if (text.contains("RTX")) return "RTX";
        if (text.contains("UHD")) return "Intel UHD";
        return null;
    }
}