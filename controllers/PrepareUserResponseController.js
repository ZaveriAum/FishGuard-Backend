const prepareResponseForFrontend = async ()=>{
    
    try {
      const {
        clickedUrl,
        sourcePageUrl,
        sourcePageTitle,
        riskIndicators,
        webRiskVerdict,
        sourceSnippet
      } = req.body;
  
      const markdown = await generateRiskExplanation({
        clickedUrl,
        sourcePageUrl,
        sourcePageTitle,
        riskIndicators: riskIndicators.join(', '),
        webRiskVerdict,
        sourceSnippet
      });
  
      // Simple Markdown-to-JSON parser
      const lines = markdown.split('\n');
      const extract = (header) => {
        const idx = lines.findIndex(l => l.startsWith(`**${header}:**`));
        if (idx === -1) return '';
        let text = lines[idx].replace(`**${header}:**`, '').trim();
        for (let i = idx + 1; i < lines.length && !lines[i].startsWith('**'); i++) {
          text += ' ' + lines[i].trim();
        }
        return text.trim();
      };
  
      const safetyTipsBlock = extract('Safety Tips');
      const safetyTips = safetyTipsBlock
        .split('\n')
        .map(l => l.replace(/^-\s*/, '').trim())
        .filter(Boolean);
  
      res.json({
        riskSummary:    extract('Risk Summary'),
        detailedReason: extract('Detailed Reason'),
        nextSteps:      extract('Next Steps'),
        safetyTips
      });
    } catch (err) {
      console.error('Error in /api/explain-link:', err);
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
}