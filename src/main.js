import { Actor } from 'apify';
import { CheerioCrawler, Dataset } from 'crawlee';


await Actor.init();

try {
    // Get input from Apify platform
    const input = await Actor.getInput() ?? {};
    
    const {
        profileUrls = [],
        maxProfiles = 50,
        proxyConfiguration = { useApifyProxy: false },
        delayBetweenRequests = 2000, // 2 seconds - respect rate limits
    } = input;

    // Validate input
    if (!profileUrls || profileUrls.length === 0) {
        throw new Error('No profile URLs provided. Please add at least one LinkedIn profile URL.');
    }

    console.log(`Starting scraper with ${profileUrls.length} profile(s)`);
    console.log(`Max profiles to scrape: ${maxProfiles}`);

    // Setup proxy if enabled
    let proxyConfig = undefined;
    if (proxyConfiguration.useApifyProxy) {
        proxyConfig = await Actor.createProxyConfiguration({
            groups: ['RESIDENTIAL'], // Use datacenter for free tier
        });
        console.log('Proxy configuration enabled');
    }

    // Counter for scraped profiles
    let scrapedCount = 0;

    // Create the crawler
    const crawler = new CheerioCrawler({
        proxyConfiguration: proxyConfig,
        
        // Request handling options
        maxRequestsPerCrawl: maxProfiles,
        maxConcurrency: 1, // Sequential requests to avoid rate limiting
        
        // Delay between requests (be polite!)
        maxRequestRetries: 2,
        requestHandlerTimeoutSecs: 60,
        
        // Custom request handler
        async requestHandler({ request, $, log }) {
            log.info(`Scraping: ${request.url}`);
            
            try {
                // Check if we've hit the limit
                if (scrapedCount >= maxProfiles) {
                    log.info('Maximum profile limit reached');
                    return;
                }

                // Extract profile data from public LinkedIn page
                const profileData = {
                    url: request.url,
                    scrapedAt: new Date().toISOString(),
                    
                    // Basic info (available on public profiles without login)
                    name: $('h1.top-card-layout__title').first().text().trim() || 
                          $('h1.text-heading-xlarge').first().text().trim() ||
                          null,
                    
                    headline: $('.top-card-layout__headline').first().text().trim() ||
                              $('div.text-body-medium').first().text().trim() ||
                              null,
                    
                    location: $('.top-card-layout__location').first().text().trim() ||
                              $('span.text-body-small').first().text().trim() ||
                              null,
                    
                    about: $('.core-section-container__content p').first().text().trim() ||
                           $('div.summary').text().trim() ||
                           null,
                    
                    // Experience section
                    experience: [],
                    
                    // Education section  
                    education: [],
                    
                    // Skills (limited on public view)
                    skills: [],
                };

                // Extract experience (limited on public profiles)
                $('.experience-item, .profile-section-card').each((i, elem) => {
                    const title = $(elem).find('.profile-section-card__title, h3').first().text().trim();
                    const company = $(elem).find('.profile-section-card__subtitle, h4').first().text().trim();
                    const duration = $(elem).find('.date-range, .profile-section-card__meta').first().text().trim();
                    
                    if (title || company) {
                        profileData.experience.push({
                            title: title || null,
                            company: company || null,
                            duration: duration || null,
                        });
                    }
                });

                // Extract education
                $('.education-item, .profile-section-card').each((i, elem) => {
                    const school = $(elem).find('.profile-section-card__title, h3').first().text().trim();
                    const degree = $(elem).find('.profile-section-card__subtitle, h4').first().text().trim();
                    const years = $(elem).find('.date-range, .profile-section-card__meta').first().text().trim();
                    
                    if (school || degree) {
                        profileData.education.push({
                            school: school || null,
                            degree: degree || null,
                            years: years || null,
                        });
                    }
                });

                // Extract skills (very limited on public view)
                $('.skill-item, .skill-card').each((i, elem) => {
                    const skill = $(elem).text().trim();
                    if (skill && !profileData.skills.includes(skill)) {
                        profileData.skills.push(skill);
                    }
                });

                // Check if profile has data (indicates successful scrape)
                if (!profileData.name && !profileData.headline) {
                    log.warning(`Limited data extracted from ${request.url}. Profile may require login or be private.`);
                    profileData.status = 'limited_access';
                    profileData.note = 'Public profile data limited. Full details require LinkedIn login.';
                } else {
                    profileData.status = 'success';
                    scrapedCount++;
                }

                // Save to dataset
                await Dataset.pushData(profileData);
                log.info(`✓ Scraped profile ${scrapedCount}/${maxProfiles}: ${profileData.name || 'Unknown'}`);

                // Delay to respect rate limits
                if (delayBetweenRequests > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
                }

            } catch (error) {
                log.error(`Error scraping ${request.url}:`, error);
                
                // Save error info to dataset
                await Dataset.pushData({
                    url: request.url,
                    status: 'error',
                    error: error.message,
                    scrapedAt: new Date().toISOString(),
                });
            }
        },

        // Error handler
        failedRequestHandler({ request, log }, error) {
            log.error(`Request failed after retries: ${request.url}`, error);
        },
    });

    // Prepare URLs for crawling
    const requests = profileUrls.slice(0, maxProfiles).map(url => {
        // Normalize URL
        let cleanUrl = url.trim();
        
        // Ensure it's a LinkedIn profile URL
        if (!cleanUrl.includes('linkedin.com')) {
            console.warn(`Skipping invalid URL: ${url}`);
            return null;
        }
        
        return { url: cleanUrl };
    }).filter(Boolean);

    console.log(`Prepared ${requests.length} requests for crawling`);

    // Run the crawler
    await crawler.run(requests);

    // Get final stats
    const dataset = await Dataset.open();
    const { itemCount } = await dataset.getInfo();

    console.log('========================================');
    console.log('Scraping completed!');
    console.log(`Total profiles processed: ${itemCount}`);
    console.log(`Successfully scraped: ${scrapedCount}`);
    console.log('========================================');

    // Set output for easy access
    await Actor.setValue('OUTPUT', {
        status: 'completed',
        totalProcessed: itemCount,
        successfulScrapes: scrapedCount,
        timestamp: new Date().toISOString(),
        message: 'Scraping completed. Check the dataset for results.',
    });

} catch (error) {
    console.error('Fatal error:', error);
    
    await Actor.setValue('OUTPUT', {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
    });
    
    throw error;
}

await Actor.exit();
