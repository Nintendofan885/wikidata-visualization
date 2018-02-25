import React, { Component } from 'react'
import {
  FormGroup,
  Button,
  Row,
  Col,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'
import FaClose from 'react-icons/lib/fa/close'
import GoChevronUp from 'react-icons/lib/go/chevron-up'
import GoChevronDown from 'react-icons/lib/go/chevron-down'
import GoChevronLeft from 'react-icons/lib/go/chevron-left'
import GoChevronRight from 'react-icons/lib/go/chevron-right'
import { readExample } from '../utils/examples'
import AceEditor from 'react-ace'
import 'brace/mode/sparql'
import 'brace/theme/tomorrow'
import 'brace/ext/language_tools'
import Resizable from 're-resizable'
import { keywords, snippets } from '../utils/sparql'
import { PulseLoader } from 'react-spinners'
import * as d3 from 'd3'

const minHeight = 40
const defaultHeight = 300

class Query extends Component {
  state = {
    code: '',
    height: defaultHeight
  }

  componentWillReceiveProps(nextProps) {
    // update loading icon
    d3
      .select('#query-text')
      .select('div')
      .style('display', nextProps.status === 'waiting' ? 'inline' : 'none')

    // udpate width
    if (nextProps.width !== this.props.width) {
      this.resizable.setState({ width: nextProps.width }, () => {
        this.onEditorResize()
      })
    }
    this.receiveExampleCode(nextProps.exampleIndex)
  }

  componentDidUpdate() {
    this.onEditorResize()
  }

  myCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
      // disable the Return key as suggestion comfirmation key
      editor.completer.keyboardHandler.commandKeyBinding.return = null

      callback(
        null,
        keywords.map(word => {
          return {
            caption: word,
            value: word,
            meta: 'keyword'
          }
        })
      )
      callback(
        null,
        Object.keys(snippets).map(title => {
          return {
            caption: title,
            value: snippets[title],
            meta: 'snippets'
          }
        })
      )
    }
  }

  receiveExampleCode = index => {
    if (index >= 0) {
      readExample(index).then(sparql => {
        this.setState({ code: sparql })
      })
    }
  }

  updateCode = newCode => {
    this.setState({
      code: newCode
    })
  }

  showStatus = () => {
    if (this.props.status === 'waiting') {
      return 'Querying'
    } else if (this.props.status === 'done') {
      return `${this.props.numResults} results found`
    } else if (this.props.status === 'error') {
      return 'Error encountered while querying'
    } else if (this.props.status === 'empty') {
      return 'No result found'
    } else if (this.props.status === 'timeout') {
      return 'Query timeout'
    } else if (this.props.status === 'cancelled') {
      return 'Query is cancelled'
    }
  }

  onEditorResize = () => {
    if (this.refs.aceEditor != null) this.refs.aceEditor.editor.resize()
  }

  render() {
    return (
      <form>
        <FormGroup>
          <Resizable
            ref={c => {
              this.resizable = c
            }}
            defaultSize={{ width: '100%', height: defaultHeight }}
            size={{ height: this.state.height }}
            minHeight={minHeight}
            onResize={this.onEditorResize}
            onResizeStop={(e, direction, ref, d) => {
              console.log('test')
              this.setState({ height: this.state.height + d.height })
            }}
            enable={{
              top: false,
              right: false,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false
            }}
          >
            <AceEditor
              ref="aceEditor"
              mode="sparql"
              theme="tomorrow"
              height="100%"
              width="100%"
              value={this.state.code}
              fontSize={14}
              showPrintMargin={false}
              tabSize={2}
              onChange={this.updateCode}
              onBeforeLoad={() =>
                this.updateCode('# Enter a Wikidata SPARQL query here')
              }
              onLoad={_editor => {
                // Remove warning message on console:
                // Automatically scrolling cursor into view after selection change this will be disabled in the next version set editor.$blockScrolling = Infinity to disable this message
                _editor.$blockScrolling = Infinity
              }}
              enableBasicAutocompletion={[this.myCompleter]}
              enableLiveAutocompletion={true}
            />
          </Resizable>
        </FormGroup>
        <Row>
          <Col xs={12} sm={9} className="no-padding-right">
            <Button
              bsStyle="primary"
              onClick={() => this.props.onSubmit(this.state.code)}
            >
              Submit
            </Button>{' '}
            <span
              id="query-text"
              className="grey-text padding-5-left"
              style={{ whiteSpace: 'nowrap' }}
            >
              {this.showStatus()}
              <PulseLoader color={'#999'} size={4} loading={true} />
            </span>
            {this.props.status === 'waiting' && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="cancel-tooltip">cancel this query</Tooltip>
                }
              >
                <span style={{ marginLeft: '5px' }}>
                  <FaClose
                    className="clickable-icon"
                    color="#999"
                    onClick={() => this.props.onCancel()}
                  />
                </span>
              </OverlayTrigger>
            )}
          </Col>
          <Col
            xsHidden
            sm={3}
            className="no-padding-left padding-5-top align-right"
          >
            {!this.props.editorFullScreen &&
              this.props.chartId < 2 && (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="hide-editor">hide editor</Tooltip>}
                >
                  <GoChevronLeft
                    className="clickable-icon query-icon"
                    onClick={() => this.props.onHide()}
                    size={20}
                  />
                </OverlayTrigger>
              )}
            {this.state.height !== minHeight &&
              !this.props.editorFullScreen &&
              this.props.chartId < 2 && (
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="minimize-editor">minimize editor</Tooltip>
                  }
                >
                  <GoChevronUp
                    className="clickable-icon query-icon"
                    onClick={() => this.setState({ height: minHeight })}
                    size={20}
                  />
                </OverlayTrigger>
              )}
            {this.state.height === minHeight && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="restore-editor">restore editor size</Tooltip>
                }
              >
                <GoChevronDown
                  className="clickable-icon query-icon"
                  onClick={() => this.setState({ height: defaultHeight })}
                  size={20}
                />
              </OverlayTrigger>
            )}
            {!this.props.editorFullScreen && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="expand-editor">expand editor</Tooltip>}
              >
                <GoChevronRight
                  className="clickable-icon query-icon"
                  onClick={this.props.onChangeEditorSize}
                  size={20}
                />
              </OverlayTrigger>
            )}
            {this.props.editorFullScreen && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="collapse-editor">collapse editor</Tooltip>
                }
              >
                <GoChevronLeft
                  className="clickable-icon query-icon"
                  onClick={this.props.onChangeEditorSize}
                  size={20}
                />
              </OverlayTrigger>
            )}
          </Col>
        </Row>
      </form>
    )
  }
}

export default Query
