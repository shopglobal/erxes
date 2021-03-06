import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { Form as CommonForm } from '/imports/react-ui/settings/common/components';
import SelectBrand from '../SelectBrand';
import CopyToClipboard from 'react-copy-to-clipboard';

const propTypes = {
  object: PropTypes.object,
  save: PropTypes.func,
  brands: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
};

class TopicForm extends CommonForm {
  constructor(props, context) {
    super(props, context);

    let code = '';

    // showed install code automatically in edit mode
    if (props.object) {
      code = this.constructor.getInstallCode(props.object._id);
    }

    this.state = {
      code,
      copied: false,
      selectedCategories: this.getSelectedCategories(),
    };

    this.handleBrandChange = this.handleBrandChange.bind(this);
  }

  getCategories() {
    const { categories } = this.props;
    let results = [];

    results.push({
      label: 'Categories',
      options: categories.map(category => ({
        label: category.title,
        value: category._id,
      })),
    });
    return results;
  }

  getSelectedCategories() {
    const { object = {} } = this.props;
    return (object.categories || []).map(category => ({
      label: category.title,
      value: category._id,
    }));
  }

  static installCodeIncludeScript() {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${Meteor.settings.public.CDN_HOST}/knowledgeBaseWidget.bundle.js";
        script.async = true;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  }

  static getInstallCode(topicId) {
    return `
      <script>
        window.erxesSettings = {
          knowledgeBase: {
            topic_id: "${topicId}"
          },
        };
        ${TopicForm.installCodeIncludeScript()}
      </script>
    `;
  }

  renderInstallCode() {
    if (this.props.object && this.props.object._id) {
      return (
        <FormGroup controlId="install-code">
          <ControlLabel>Install code</ControlLabel>
          <div className="markdown-wrapper">
            <ReactMarkdown source={this.state.code} />
            {this.state.code
              ? <CopyToClipboard
                  text={this.state.code}
                  onCopy={() => this.setState({ copied: true })}
                >
                  <Button bsSize="small" bsStyle="primary">
                    {this.state.copied ? 'Copied' : 'Copy to clipboard'}
                  </Button>
                </CopyToClipboard>
              : null}
          </div>
        </FormGroup>
      );
    } else {
      return null;
    }
  }

  handleBrandChange() {
    if (this.props.object && this.props.object._id) {
      const code = this.constructor.getInstallCode(this.props.object._id);
      this.setState({ code, copied: false });
    }
  }

  generateDoc() {
    const categoryIds = this.state.selectedCategories.map(category => category.value);
    const { object } = this.props;

    return {
      ...object,
      doc: {
        title: document.getElementById('knowledgebase-title').value,
        description: document.getElementById('knowledgebase-description').value,
        brandId: document.getElementById('selectBrand').value,
        categoryIds,
      },
    };
  }

  renderContent(object = {}) {
    const { brands } = this.props;
    const { brand } = object;
    const brandId = brand != null ? brand._id : '';

    return (
      <div>
        <FormGroup controlId="knowledgebase-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={object.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-description">
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" defaultValue={object.description} />
        </FormGroup>

        <FormGroup>
          <SelectBrand brands={brands} defaultValue={brandId} onChange={this.handleBrandChange} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Categories</ControlLabel>

          <Select
            placeholder="Choose categories"
            onChange={items => {
              this.setState({ selectedCategories: items });
            }}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            value={this.state.selectedCategories}
            options={this.getCategories()}
            multi
          />
        </FormGroup>

        {this.renderInstallCode()}
      </div>
    );
  }
}

TopicForm.propTypes = propTypes;
export default TopicForm;
