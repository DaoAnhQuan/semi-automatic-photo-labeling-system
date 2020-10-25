import React, { Component } from "react";
import LabelingApp from "./LabelingApp";

import { Loader, ImageGroup } from "semantic-ui-react";
import DocumentMeta from "react-document-meta";
import axios from "axios";
import { demoMocks } from "./demo";
import { message } from "antd";
import { history } from "../../_helpers/history";
export default class LabelingLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: null,
      image: null,
      isLoaded: false,
      error: null,
      listIds: [],
      review: props.review,
      images: [],
      listReviewResult: [],
    };
  }
  changeState_ListResult = (listResult) => {
    this.setState({
      listReviewResult: listResult,
    });
  };

  async fetch(...args) {
    const { projectId } = this.props.match.params;
    if (projectId === "demo") {
      const path = typeof args[0] === "string" ? args[0] : args[0].pathname;
      return demoMocks[path](...args);
    }

    return await fetch(...args);
  }

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.imageId !== this.props.match.params.imageId) {
      this.refetch();
    }
  }
  redirectTo = (imageId) => {
    // const { history } = this.props;
    const { projectId } = this.props.match.params;

    history.replace(`/review/${projectId}/${imageId}`);
  };
  async refetch() {
    this.setState({
      isLoaded: false,
      error: null,
      project: null,
      image: null,
    });

    // const { match, history } = this.props;
    const { match } = this.props;
    const { projectId, imageId } = match.params;
    const user = JSON.parse(localStorage.getItem("user"));

    //use for review  page

    try {
      const { project, image } = await (
        await this.fetch(
          `http://localhost:8000/api/getLabelingInfo/${projectId}/${imageId}/`
        )
      ).json();

      if (!project) {
        history.replace(`/label/${projectId}/over`);
        return;
      }

      if (this.state.review) {
        history.replace(`/review/${project.id}/${image.id}`);
      } else {
        history.replace(`/label/${project.id}/${image.id}`);
      }

      this.setState({
        isLoaded: true,
        project,
        image,
      });
      if (this.props.review) {
        await axios
          .get(
            `http://localhost:8000/api/listImage/${projectId}?completed=${true}&user=${-1}`
          )
          .then((res) => {
            const images = res.data;
            const listIds = images.map((image) => image.id);

            this.setState({ images, listIds });
          });
      } else {
        await axios
          .get(
            `http://localhost:8000/api/listImage/${projectId}?completed=${false}&user=${
              user.id
            }`
          )
          .then((res) => {
            const images = res.data;
            const listIds = images.map((image) => image.id);
            this.setState({ images, listIds });
          });
      }

      await axios
        .get(
          `http://localhost:8000/api/getReviewResult/${projectId}/${user.id}`
        )
        .then((res) => {
          this.setState({
            listReviewResult: res.data.data,
          });
          const change = {};
          for (let i = 0; i < this.state.listReviewResult.length; i++) {
            const rest = this.state.listReviewResult[i];
            change[rest.image_id] = rest.result;
          }
          this.setState({
            listReviewResult: change,
          });
          console.log(this.state.listReviewResult);
        });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }
  async reviewImage(result) {
    const { imageId } = this.props.match.params;
    // const { match, history } = this.props;
    const { match } = this.props;
    const user = JSON.parse(localStorage.getItem("user"));
    await this.fetch(
      `http://localhost:8000/api/reviewImage/${imageId}/${user.id}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result: result,
        }),
      }
    )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    // console.log(this.state.project.id, imageId);
    // console.log(history)
    // history.replace(`/review/${this.state.project.id}/${imageId}`);
    // console.log(imageId, userId);
  }
  async pushUpdate(labelData) {
    const { imageId } = this.props.match.params;
    await this.fetch(`http://localhost:8000/api/changeLabel/${imageId}/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ labelData }),
    });
  }

  async markComplete() {
    const { imageId } = this.props.match.params;
    // const { history } = this.props;
    await this.fetch(
      `http://localhost:8000/images/${imageId}/mark_completed/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ labeled: true }),
      }
    ).then((res) => {
      console.log(res);
      message.success("submitted");
    });
    await this.refetch();
    if (this.state.listIds.length == 0) {
      history.push(`/project/${this.state.project.id}`);
      message.success("All is completed");
    }
  }

  async imageAutoDetect() {
    // const { match, history } = this.props;
    const { match } = this.props;
    const { projectId, imageId } = match.params;

    try {
      const { project, image } = await (
        await this.fetch(
          `http://localhost:8000/api/imageDetect/${projectId}/${imageId}/`
        )
      ).json();
      history.go();
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  render() {
    // const { history } = this.props;
    const { project, image, isLoaded, error, listIds } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    const title = `Image ${image.id} for project ${project.project_name} -- Label Tool`;
    const a = parseInt(image.id);
    let index = listIds.indexOf(a);
    index = ++index % listIds.length;
    const idNext = listIds[index];
    // console.log(a, index, idNext);
    const props = {
      onBack: () => {
        history.goBack();
      },
      onSkip: () => {
        if (this.state.review) {
          history.push(`/review/${project.id}/${idNext}`);
        } else {
          if (listIds.length > 1) {
            history.push(`/label/${project.id}/${idNext}`);
          } else {
            message.warning("this is the last image! can't skip");
          }
        }
      },
      onSubmit: async () => {
        this.markComplete();
        if (this.state.review) {
          history.push(`/review/${project.id}/${idNext}`);
        } else {
          if (idNext) {
            history.push(`/label/${project.id}/${idNext}`);
          } else {
            history.push(`/project/${project.id}`);
          }
        }
      },
      onLabelChange: this.pushUpdate.bind(this),

      onImageDetect: () => {
        this.imageAutoDetect();
      },
      reviewImage: (result) => {
        this.reviewImage(result);
      },
      redirectTo: (imageId) => {
        this.redirectTo(imageId);
      },
      changeList: (list) => {
        this.changeState_ListResult(list);
      },
    };

    const { referenceLink, referenceText } = project;

    return (
      <DocumentMeta title={title}>
        {console.log(this.props.location)}
        <LabelingApp
          labels={project.forms}
          reference={{ referenceLink, referenceText }}
          labelData={image.labelData.labels || {}}
          imageUrl={image.link}
          fetch={this.fetch.bind(this)}
          demo={project.id === "demo"}
          {...props}
          review={this.state.review}
          images={this.state.images}
          image={image}
          reviewList={this.state.listReviewResult}
          refetch={this.refetch.bind(this)}
          projectId={this.state.project.id}
        />
      </DocumentMeta>
    );
  }
}
