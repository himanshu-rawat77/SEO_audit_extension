import React, { useEffect, useState } from 'react';

const SEOInfo = () => {
  const [seoData, setSeoData] = useState({
    title: '',
    metaDescription: '',
    canonical: '',
    h1: '',
    images: [],
    altTexts: [],
    links: [],
    viewport: false,
  });
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Execute script to gather SEO data from the page
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: () => {
            // Collect SEO-related data from the active webpage
            const images = [...document.querySelectorAll('img')].map((img) => img.src);
            const altTexts = [...document.querySelectorAll('img')].map((img) => img.alt || '');
            const links = [...document.querySelectorAll('a')].map((a) => ({
              url: a.href,
              anchor: a.textContent || a.href
            }));
            const viewport = document.querySelector('meta[name="viewport"]') !== null;

            return {
              title: document.title || '',
              metaDescription: document.querySelector('meta[name="description"]')?.content || 'No meta description found',
              canonical: document.querySelector('link[rel="canonical"]')?.href || 'No canonical URL found',
              h1: document.querySelector('h1')?.textContent || 'No H1 tag found',
              images,
              altTexts,
              links,
              viewport,
            };
          }
        },
        (results) => {
          if (results && results[0]) {
            // Set the fetched SEO data
            setSeoData(results[0].result);
            generateSuggestions(results[0].result);
          }
        }
      );
    });
  }, []);

  // Function to generate SEO improvement suggestions
  const generateSuggestions = (data) => {
    const suggestionsArray = [];

    // Check Title
    if (data.title.length > 60) {
      suggestionsArray.push('Title is too long. Keep it under 60 characters.');
    } else if (data.title.length === 0) {
      suggestionsArray.push('Title is missing. Add a title tag.');
    } else {
      suggestionsArray.push('Title looks good.');
    }

    // Check Meta Description
    if (data.metaDescription.length < 50) {
      suggestionsArray.push('Meta description is too short. Aim for at least 50-160 characters.');
    } else if (data.metaDescription.length > 160) {
      suggestionsArray.push('Meta description is too long. Keep it under 160 characters.');
    } else {
      suggestionsArray.push('Meta description length is optimal.');
    }

    // Check H1
    if (!data.h1) {
      suggestionsArray.push('H1 tag is missing. Add an H1 tag to your page.');
    } else {
      suggestionsArray.push('H1 tag looks good.');
    }

    // Check Canonical URL
    if (!data.canonical) {
      suggestionsArray.push('Canonical tag is missing. Consider adding one to avoid duplicate content issues.');
    } else {
      suggestionsArray.push('Canonical tag is present.');
    }

    // Check Alt Texts for images
    if (data.altTexts.some((altText) => altText === '')) {
      suggestionsArray.push('Some images are missing alt text. Add descriptive alt text for all images.');
    } else {
      suggestionsArray.push('All images have alt text.');
    }

    // Check Internal and External Links
    if (data.links.length === 0) {
      suggestionsArray.push('No internal or external links found. Add links to improve navigation and SEO.');
    } else {
      suggestionsArray.push('Links are present.');
    }

    // Check Viewport Meta Tag
    if (!data.viewport) {
      suggestionsArray.push('Viewport meta tag is missing. Add a viewport tag for better mobile responsiveness.');
    } else {
      suggestionsArray.push('Viewport meta tag is present.');
    }

    // Set suggestions in state
    setSuggestions(suggestionsArray);
  };

  return (
    <div className="seo-info">
      <h1>SEO Audit Report</h1>
      <div className="seo-section">
        <h2>Title</h2>
        <p>{seoData.title}</p>
      </div>
      <div className="seo-section">
        <h2>Meta Description</h2>
        <p>{seoData.metaDescription}</p>
      </div>
      <div className="seo-section">
        <h2>H1 Tag</h2>
        <p>{seoData.h1}</p>
      </div>
      <div className="seo-section">
        <h2>Canonical Tag</h2>
        <p>{seoData.canonical}</p>
      </div>
      <div className="seo-section">
        <h2>Images & Alt Texts</h2>
        <ul>
          {seoData.images.map((image, index) => (
            <li key={index}>
              <img src={image} alt={seoData.altTexts[index] || 'No Alt Text'} width="100" />
              <p>Alt: {seoData.altTexts[index] || 'No Alt Text'}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="seo-section">
        <h2>Links</h2>
        <ul>
          {seoData.links.map((link, index) => (
            <li key={index}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.anchor}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="seo-suggestions">
        <h2>Suggestions for Improvement</h2>
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SEOInfo;
