'use client';

import { useState } from 'react';
import AdWrapper from './shared/AdWrapper';

/**
 * Product Configurator Ad — Pick colors/materials, see live preview.
 */
export default function ConfiguratorAd({
  baseImage,
  options = [],
  brandName,
  headline,
  cta,
  ctaFont = "'Cormorant Garamond', Georgia, serif",
}) {
  const [selections, setSelections] = useState(() => {
    const init = {};
    options.forEach(o => {
      init[o.id] = o.choices[0];
    });
    return init;
  });

  const select = (optionId, choice) => {
    setSelections(prev => ({ ...prev, [optionId]: choice }));
  };

  const currentCarImage = selections['style']?.overlayImage || baseImage;

  return (
    <AdWrapper brandName={brandName} headline={headline} cta={cta} ctaFont={ctaFont}>
      <div className='cfg-ad'>
        <div className='cfg-preview'>
          <div
            className='cfg-preview-base'
            style={{
              backgroundImage: `url(${currentCarImage})`,
            }}
          />
        </div>

        <div className='cfg-options'>
          {options.map(opt => (
            <div key={opt.id} className='cfg-option-group'>
              <span className='cfg-option-label'>{opt.label}</span>
              <div className='cfg-option-choices'>
                {opt.choices.map((choice, i) => {
                  const isActive = selections[opt.id]?.name === choice.name;

                  return (
                    <button
                      key={i}
                      className={`cfg-choice ${isActive ? 'cfg-choice--active' : ''} ${choice.color ? 'cfg-choice--color' : ''}`}
                      onClick={() => select(opt.id, choice)}
                      style={
                        choice.color
                          ? { backgroundColor: choice.color }
                          : undefined
                      }
                      title={choice.name}
                    >
                      {!choice.color && choice.name}
                    </button>
                  );
                })}
              </div>

              {opt.id === 'style' && selections[opt.id] && (
                <div className='cfg-selected-name'>
                  {selections[opt.id].name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdWrapper>
  );
}
